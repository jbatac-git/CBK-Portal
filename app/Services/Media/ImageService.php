<?php

namespace App\Services\Media;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;

class ImageService
{
    public function __construct(private ImageManager $manager) {}

    /**
     * Crops/covers the image to an EXACT size and stores it as WebP on the
     * `public` disk. The server re-does this regardless of what the browser
     * cropper already did, so the final size is always consistent and
     * cannot be forged by a tampered client.
     */
    public function storeResized(UploadedFile $file, string $directory, int $width, int $height): string
    {
        $image = $this->manager->read($file->getRealPath())->cover($width, $height);

        $path = trim($directory, '/').'/'.Str::uuid().'.webp';

        Storage::disk('public')->put($path, (string) $image->toWebp(90));

        return $path;
    }

    public function delete(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}