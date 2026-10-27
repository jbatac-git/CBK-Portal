<?php

namespace App\Services\PriceLists;

use App\Enums\PriceListFileType;
use App\Enums\PriceListStatus;
use App\Models\PriceList;
use App\Models\User;
use DomainException;
use finfo;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class PriceListService
{
    public function __construct(private ExcelDownloadStamper $stamper) {}

    // ---- Admin side ----

    public function list(?string $search, ?string $status, int $perPage = 15): LengthAwarePaginator
    {
        return PriceList::query()
            ->with('uploader')
            ->when($search, fn ($q) => $q->where('title', 'ilike', "%{$search}%"))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest('effective_date')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data, UploadedFile $file, User $actor): PriceList
    {
        return PriceList::create([
            'title' => $data['title'],
            'effective_date' => $data['effective_date'] ?? null,
            'status' => $data['status'],
            'uploaded_by' => $actor->id,
            ...$this->storeFile($file),
        ]);
    }

    public function update(PriceList $priceList, array $data, ?UploadedFile $file): PriceList
    {
        $updates = [
            'title' => $data['title'],
            'effective_date' => $data['effective_date'] ?? null,
            'status' => $data['status'],
        ];

        if ($file) {
            $oldDisk = $priceList->file_disk;
            $oldPath = $priceList->file_path;

            $priceList->update([...$updates, ...$this->storeFile($file)]);
            Storage::disk($oldDisk)->delete($oldPath);
        } else {
            $priceList->update($updates);
        }

        return $priceList->fresh();
    }

    public function archive(PriceList $priceList): void
    {
        if ($priceList->status === PriceListStatus::Archived) {
            throw new DomainException('This price list is already archived.');
        }

        $priceList->update(['status' => PriceListStatus::Archived]);
    }

    // ---- Portal (Diser) side ----

    public function activeForPortal()
    {
        return PriceList::active()->orderByDesc('effective_date')->get();
    }

    // ---- Opening a file (both sides) ----

    /**
     * Logs who opened the price list, then serves it: a PDF opens in the
     * browser; an Excel workbook downloads as a copy stamped with the
     * downloader's name, username, time and the log's reference number.
     */
    public function download(PriceList $priceList, User $user, ?string $ipAddress): Response
    {
        $disk = Storage::disk($priceList->file_disk);
        abort_unless($disk->exists($priceList->file_path), 404);

        $download = $priceList->downloads()->create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'username' => $user->username,
            'ip_address' => $ipAddress,
        ]);

        $type = $priceList->fileType();
        $filename = (Str::slug($priceList->title) ?: 'price-list').'.'.$type->extension();
        $headers = [
            'Content-Type' => $type->value,
            // Never cached on disk or shared caches: each copy belongs to one person.
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
        ];

        if ($type === PriceListFileType::Pdf) {
            return $disk->response($priceList->file_path, $filename, $headers);
        }

        $stampedPath = $this->stamper->stamp($disk->readStream($priceList->file_path), [
            "Downloaded by {$user->name} (@{$user->username})",
            $download->created_at->timezone(config('portal.price_lists.stamp_timezone'))->format('M j, Y g:i A')
                ." · Ref {$download->id}",
        ]);

        return response()->download($stampedPath, $filename, $headers)->deleteFileAfterSend();
    }

    /**
     * Stores the upload on the private disk under the extension of what it
     * really is, never trusting the client's name or MIME type.
     *
     * @return array{file_disk: string, file_path: string, mime_type: string, file_size: int}
     */
    private function storeFile(UploadedFile $file): array
    {
        $type = $this->detectFileType($file);

        return [
            'file_disk' => 'local',
            'file_path' => $file->storeAs('price-lists', Str::random(40).'.'.$type->extension(), 'local'),
            'mime_type' => $type->value,
            'file_size' => $file->getSize(),
        ];
    }

    private function detectFileType(UploadedFile $file): PriceListFileType
    {
        $realMime = (new finfo(FILEINFO_MIME_TYPE))->file($file->getRealPath());

        if ($realMime === PriceListFileType::Pdf->value) {
            return PriceListFileType::Pdf;
        }

        if ($this->stamper->isWorkbook($file->getRealPath())) {
            return PriceListFileType::Excel;
        }

        throw new DomainException("The uploaded file must be a PDF or an Excel workbook saved as .xlsx (detected: {$realMime}).");
    }
}
