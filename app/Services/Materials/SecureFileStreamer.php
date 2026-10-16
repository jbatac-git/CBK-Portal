<?php

namespace App\Services\Materials;

use App\Models\LearningMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\Response;

class SecureFileStreamer
{
    public function stream(Request $request, LearningMaterial $material): Response
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
            'Content-Disposition' => $this->inlineDisposition($material->title),
        ];

        if (! $range) {
            return response()->stream(function () use ($disk, $material) {
                $stream = $disk->readStream($material->file_path);
                fpassthru($stream);
                fclose($stream);
            }, 200, [...$baseHeaders, 'Content-Length' => $size]);
        }

        $parsed = $this->parseRange($range, $size);

        if ($parsed === null) {
            return response('', 416, ['Content-Range' => "bytes */{$size}"]);
        }

        [$start, $end] = $parsed;

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

    /**
     * Parses a single "bytes=START-END", "bytes=START-" or suffix
     * "bytes=-LENGTH" range. Returns null for anything unsatisfiable or
     * unsupported (including multi-range requests), which becomes a 416.
     *
     * @return array{0: int, 1: int}|null
     */
    private function parseRange(string $header, int $size): ?array
    {
        if ($size === 0 || ! preg_match('/^bytes=(\d*)-(\d*)$/', trim($header), $m) || ($m[1] === '' && $m[2] === '')) {
            return null;
        }

        if ($m[1] === '') {
            // Suffix range: the last N bytes of the file.
            $length = min((int) $m[2], $size);

            return $length > 0 ? [$size - $length, $size - 1] : null;
        }

        $start = (int) $m[1];
        $end = $m[2] === '' ? $size - 1 : min((int) $m[2], $size - 1);

        return $start <= $end ? [$start, $end] : null;
    }

    /** Builds a header-safe filename, with a UTF-8 variant for non-ASCII titles. */
    private function inlineDisposition(string $title): string
    {
        $name = trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $title)) ?: 'material';
        $fallback = trim((string) preg_replace('/[^\x20-\x7E]|["\\\\%\/]/', '', $name)) ?: 'material';

        return HeaderUtils::makeDisposition(HeaderUtils::DISPOSITION_INLINE, $fallback, $name);
    }
}
