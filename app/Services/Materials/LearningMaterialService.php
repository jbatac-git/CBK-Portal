<?php

namespace App\Services\Materials;

use App\Enums\MaterialStatus;
use App\Enums\MaterialType;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialCategory;
use App\Models\User;
use DomainException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LearningMaterialService
{
    // ---- Admin side ----

    public function list(?string $search, ?string $status, ?int $categoryId, int $perPage = 15): LengthAwarePaginator
    {
        return LearningMaterial::query()
            ->with(['category', 'uploader'])
            ->when($search, fn (Builder $q) => $q->where('title', 'ilike', "%{$search}%"))
            ->when($status, fn (Builder $q) => $q->where('status', $status))
            ->when($categoryId, fn (Builder $q) => $q->where('learning_material_category_id', $categoryId))
            ->orderBy('sort_order')
            ->orderBy('title')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function formOptions(): array
    {
        return [
            'categories' => LearningMaterialCategory::active()->orderBy('name')->get(['id', 'name']),
            'max_pdf_mb' => $this->toMegabytes(MaterialType::Pdf->maxKilobytes()),
            'max_video_mb' => $this->toMegabytes(MaterialType::Video->maxKilobytes()),
        ];
    }

    public function create(array $data, ?UploadedFile $file, User $actor): LearningMaterial
    {
        $type = MaterialType::from($data['type']);
        $link = $this->linkFrom($data, $type);

        if ($link === null) {
            if (! $file) {
                throw new DomainException('Choose a file to upload.');
            }

            $this->assertRealMimeMatches($file, $type);
        }

        $source = $link === null ? $this->fileColumns($this->storeFile($file, $type)) : $this->linkColumns($link);

        return DB::transaction(fn () => LearningMaterial::create([
            'learning_material_category_id' => $data['learning_material_category_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'type' => $type,
            ...$source,
            'status' => $data['status'],
            'available_during_temporary' => $data['available_during_temporary'] ?? false,
            'sort_order' => $data['sort_order'] ?? 0,
            'uploaded_by' => $actor->id,
        ]));
    }

    public function update(LearningMaterial $material, array $data, ?UploadedFile $file): LearningMaterial
    {
        $link = $this->linkFrom($data, $material->type);

        if ($link === null && $file === null && $material->isExternalLink()) {
            throw new DomainException('Upload a file to replace the video link.');
        }

        DB::transaction(function () use ($material, $data, $file, $link) {
            $updates = [
                'learning_material_category_id' => $data['learning_material_category_id'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'],
                'available_during_temporary' => $data['available_during_temporary'] ?? false,
                'sort_order' => $data['sort_order'] ?? 0,
            ];

            // Replacing the source keeps the same TYPE (a PDF stays a PDF slot);
            // changing type at once is rare enough to just ask the admin to
            // archive this one and add a fresh material instead. A video may
            // switch between an uploaded file and an external link.
            $old = $material->file_path ? ['disk' => $material->file_disk, 'path' => $material->file_path] : null;
            $replacesFile = false;

            if ($link !== null) {
                $updates = [...$updates, ...$this->linkColumns($link)];
                $replacesFile = true;
            } elseif ($file) {
                $this->assertRealMimeMatches($file, $material->type);
                $updates = [...$updates, ...$this->fileColumns($this->storeFile($file, $material->type))];
                $replacesFile = true;
            }

            $material->update($updates);

            // Clean up only after the new row is saved.
            if ($replacesFile && $old !== null) {
                Storage::disk($old['disk'])->delete($old['path']);
            }
        });

        return $material->fresh();
    }

    public function archive(LearningMaterial $material): void
    {
        if ($material->status === MaterialStatus::Archived) {
            throw new DomainException('This material is already archived.');
        }

        $material->update(['status' => MaterialStatus::Archived]);
    }

    // ---- Portal (Diser) side ----

    /**
     * Every published material, each carrying a `locked` flag the frontend
     * uses to grey out tiles the temporary account cannot open yet.
     */
    public function portalIndex(User $user): Collection
    {
        return LearningMaterial::published()
            ->with('category')
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get()
            ->map(fn (LearningMaterial $m) => tap($m, fn ($m) => $m->locked = $m->isLockedFor($user)));
    }

    /** Returns null when the material does not exist, is not published, or is locked for this user. */
    public function findViewable(User $user, LearningMaterial $material): ?LearningMaterial
    {
        if ($material->status !== MaterialStatus::Published || $material->isLockedFor($user)) {
            return null;
        }

        return $material;
    }

    /**
     * The external link to save, or null when this save uses an uploaded
     * file. Re-checked here (not only in the Form Request) so no caller can
     * attach a link to a PDF or store an unsupported URL.
     */
    private function linkFrom(array $data, MaterialType $type): ?string
    {
        if (($data['video_source'] ?? 'upload') !== 'link') {
            return null;
        }

        $url = trim((string) ($data['external_url'] ?? ''));

        if ($type !== MaterialType::Video) {
            throw new DomainException('Only videos can use an external link.');
        }

        if (VideoEmbed::fromUrl($url) === null) {
            throw new DomainException('This video link is not supported.');
        }

        return $url;
    }

    private function linkColumns(string $url): array
    {
        return [
            'external_url' => $url,
            'file_disk' => null,
            'file_path' => null,
            'mime_type' => null,
            'file_size' => null,
        ];
    }

    private function fileColumns(array $stored): array
    {
        return [
            'external_url' => null,
            'file_disk' => $stored['disk'],
            'file_path' => $stored['path'],
            'mime_type' => $stored['mime'],
            'file_size' => $stored['size'],
        ];
    }

    private function toMegabytes(?int $kilobytes): ?int
    {
        return $kilobytes === null ? null : intdiv($kilobytes, 1024);
    }

    private function storeFile(UploadedFile $file, MaterialType $type): array
    {
        // Store outside any public path, grouped by type, with a random name
        // (never the original filename — that can carry directory traversal
        // characters or reveal internal naming to whoever sees the response).
        $path = $file->store('learning-materials/'.$type->value, 'local');

        return [
            'disk' => 'local',
            'path' => $path,
            'mime' => $file->getMimeType(),
            'size' => $file->getSize(),
        ];
    }

    /**
     * Defense in depth: the Form Request's `mimes` rule already checks the
     * real file signature, not just the extension. This is a second,
     * explicit check using finfo directly against our own whitelist, so a
     * bug or change in Laravel's validator does not silently widen what
     * we accept.
     */
    private function assertRealMimeMatches(UploadedFile $file, MaterialType $type): void
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $realMime = finfo_file($finfo, $file->getRealPath());
        finfo_close($finfo);

        if (! in_array($realMime, $type->allowedMimes(), true)) {
            throw new DomainException(
                "The uploaded file does not appear to be a valid {$type->label()} (detected: {$realMime})."
            );
        }
    }
}
