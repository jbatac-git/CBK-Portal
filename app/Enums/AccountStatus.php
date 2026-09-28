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

    /**
     * The state machine. This is the ONLY place that says which
     * status changes are legal.
     */
    public function canTransitionTo(self $to): bool
    {
        $allowed = match ($this) {
            self::Temporary => [self::Active, self::Restricted, self::Deactivated],
            self::Restricted => [self::Active, self::Deactivated],
            self::Active => [self::Deactivated],
            self::Deactivated => [],
        };

        return in_array($to, $allowed, true);
    }
}