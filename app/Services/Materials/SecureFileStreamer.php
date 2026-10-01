<?php

namespace App\Services\Materials;

use App\Models\LearningMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SecureFileStreamer
{
    public function stream(Request $request, LearningMaterial $material): StreamedResponse
    {
        $disk = Storage::disk($material->file_disk);

        abort_unless($disk->exists($material->file_path), 404);

        $size = $material->file_size;
        $mime = $material->mime_type;
        $range = $request->header('Range');

        $baseHeaders = [
            'Content-Type' => $mime,
            'Accept-Ranges' => 'bytes',
            // never cached on disk/shared caches: this is protected company content
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Disposition' => 'inline; filename="'.addslashes($material->title).'"',
        ];

        if (! $range) {
            return response()->stream(function () use ($disk, $material) {
                $stream = $disk->readStream($material->file_path);
                fpassthru($stream);
                fclose($stream);
            }, 200, [...$baseHeaders, 'Content-Length' => $size]);
        }

        [$start, $end] = $this->parseRange($range, $size);

        if ($start > $end || $end >= $size) {
            return response('', 416, ['Content-Range' => "bytes */{$size}"]);
        }

        $length = $end - $start + 1;

        return response()->stream(function () use ($disk, $material, $start, $length) {
            $stream = $disk->readStream($material->file_path);
            fseek($stream, $start);

            $remaining = $length;
            while ($remaining > 0 && ! feof($stream)) {
                $chunk = fread($stream, min(8192, $remaining));
                echo $chunk;
                $remaining -= strlen($chunk);
                flush();
            }

            fclose($stream);
        }, 206, [
            ...$baseHeaders,
            'Content-Length' => $length,
            'Content-Range' => "bytes {$start}-{$end}/{$size}",
        ]);
    }

    /** Parses "bytes=START-END" (END is optional, meaning "to the end of the file"). */
    private function parseRange(string $header, int $size): array
    {
        $range = str_replace('bytes=', '', $header);
        [$start, $end] = array_pad(explode('-', $range, 2), 2, '');

        $start = $start === '' ? 0 : (int) $start;
        $end = $end === '' ? $size - 1 : (int) $end;

        return [$start, min($end, $size - 1)];
    }
}