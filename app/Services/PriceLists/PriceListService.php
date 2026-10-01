<?php

namespace App\Services\PriceLists;

use App\Enums\PriceListStatus;
use App\Models\PriceList;
use App\Models\User;
use DomainException;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class PriceListService
{
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
        $this->assertIsRealPdf($file);

        $path = $file->store('price-lists', 'public');

        return PriceList::create([
            'title' => $data['title'],
            'effective_date' => $data['effective_date'] ?? null,
            'status' => $data['status'],
            'file_disk' => 'public',
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => $actor->id,
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
            $this->assertIsRealPdf($file);
            $old = $priceList->file_path;

            $updates = [
                ...$updates,
                'file_path' => $file->store('price-lists', 'public'),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ];

            $priceList->update($updates);
            Storage::disk('public')->delete($old);
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

    private function assertIsRealPdf(UploadedFile $file): void
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $realMime = finfo_file($finfo, $file->getRealPath());
        finfo_close($finfo);

        if (! in_array($realMime, config('portal.price_lists.allowed_mimes'), true)) {
            throw new DomainException("The uploaded file does not appear to be a valid PDF (detected: {$realMime}).");
        }
    }
}