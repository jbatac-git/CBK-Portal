<?php

namespace App\Enums;

enum PortalModule: string
{
    case Learning = 'portal.learning';
    case PriceLists = 'portal.price-lists';
    case ContactUs = 'portal.contact-us';

    public function label(): string
    {
        return match ($this) {
            self::Learning => 'Learning',
            self::PriceLists => 'Price Lists',
            self::ContactUs => 'Contact Us',
        };
    }

    /** @return array<int, string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** Modules a new Diser gets unless an authorized user picks otherwise. */
    public static function defaults(): array
    {
        return self::values();
    }
}