<?php

namespace App\Enums;

enum RemovalReason: string
{
    case Resigned = 'resigned';
    case Awol = 'awol';
    case Separated = 'separated';

    public function label(): string
    {
        return match ($this) {
            self::Resigned => 'Resigned',
            self::Awol => 'AWOL',
            self::Separated => 'Separated from the company',
        };
    }

    /** @return array<int, array{value: string, label: string}> */
    public static function options(): array
    {
        return collect(self::cases())
            ->map(fn (self $reason) => ['value' => $reason->value, 'label' => $reason->label()])
            ->values()
            ->all();
    }
}