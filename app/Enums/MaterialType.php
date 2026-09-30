<?php

namespace App\Enums;

enum MaterialType: string
{
    case Pdf = 'pdf';
    case Video = 'video';

    public function label(): string
    {
        return match ($this) {
            self::Pdf => 'PDF Document',
            self::Video => 'Training Video',
        };
    }

    /** @return array<int, string> */
    public function allowedMimes(): array
    {
        return match ($this) {
            self::Pdf => config('portal.learning_materials.allowed_pdf_mimes'),
            self::Video => config('portal.learning_materials.allowed_video_mimes'),
        };
    }

    public function maxKilobytes(): int
    {
        return match ($this) {
            self::Pdf => config('portal.learning_materials.max_pdf_kb'),
            self::Video => config('portal.learning_materials.max_video_kb'),
        };
    }
}