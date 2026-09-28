<?php

namespace App\Enums;

enum AccountStatus: string
{
    case Temporary = 'temporary';
    case Active = 'active';
    case Restricted = 'restricted';
    case Deactivated = 'deactivated';

    public function label(): string
    {
        return match ($this) {
            self::Temporary => 'Temporary',
            self::Active => 'Active',
            self::Restricted => 'Restricted',
            self::Deactivated => 'Deactivated',
        };
    }
}