<?php

namespace App\Services\Settings;

use App\Models\PortalSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortalSettingService
{
    public const CONTACT_KEYS = [
        'contact.headline',
        'contact.phone',
        'contact.email',
        'contact.website',
        'contact.location',
    ];

    public const FOOTER_KEYS = [
        'footer.company_name',
        'footer.copyright',
        'footer.contact',
        'footer.website',
        'footer.address',
    ];

    public const LOGO_KEY = 'branding.logo_path';

    /** Returns every requested key, defaulting missing ones to an empty string. */
    public function getMany(array $keys): array
    {
        $rows = PortalSetting::whereIn('key', $keys)->pluck('value', 'key');

        return collect($keys)->mapWithKeys(fn(string $key) => [$key => $rows[$key] ?? ''])->all();
    }

    public function setMany(array $data): void
    {
        DB::transaction(function () use ($data) {
            foreach ($data as $key => $value) {
                PortalSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value, 'group' => Str::before($key, '.')],
                );
            }
        });
    }

    public function logoUrl(): ?string
    {
        $path = PortalSetting::where('key', self::LOGO_KEY)->value('value');

        return $path ? Storage::disk('public')->url($path) : null;
    }

    /** The single row holding the branding logo's stored path, read without going through getMany(). */
    public function currentLogoPath(): ?string
    {
        return PortalSetting::where('key', self::LOGO_KEY)->value('value');
    }
}
