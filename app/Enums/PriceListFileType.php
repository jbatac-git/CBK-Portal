<?php

namespace App\Enums;

/** The file formats a price list may be uploaded in, keyed by the MIME type stored on the row. */
enum PriceListFileType: string
{
    case Pdf = 'application/pdf';
    case Excel = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    public function extension(): string
    {
        return match ($this) {
            self::Pdf => 'pdf',
            self::Excel => 'xlsx',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Pdf => 'PDF',
            self::Excel => 'Excel',
        };
    }

    /** @return array<int, string> */
    public static function extensions(): array
    {
        return array_map(fn (self $type) => $type->extension(), self::cases());
    }
}
