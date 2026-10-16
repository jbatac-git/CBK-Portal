<?php

namespace App\Services\Settings;

use App\Models\PortalSetting;
use Illuminate\Support\Facades\Cache;
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

    public const CAREERS_KEY = 'features.careers_enabled';

    /** Settings are read on every Inertia request, so the whole table is cached until it changes. */
    private const CACHE_KEY = 'portal_settings.all';

    /** Returns every requested key, defaulting missing ones to an empty string. */
    public function getMany(array $keys): array
    {
        $rows = $this->all();

        return collect($keys)->mapWithKeys(fn (string $key) => [$key => $rows[$key] ?? ''])->all();
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

        Cache::forget(self::CACHE_KEY);
    }

    public function logoUrl(): ?string
    {
        $path = $this->all()[self::LOGO_KEY] ?? null;

        return $path ? Storage::disk('public')->url($path) : null;
    }

    /**
     * ['contact.headline' => 'x', 'contact.phone' => 'y'] + 'contact.'
     * -> ['headline' => 'x', 'phone' => 'y']
     * Converts our flat DB-key shape into the nested shape the frontend
     * form (and the nested validation rules) expect.
     */
    public function stripPrefix(array $flat, string $prefix): array
    {
        return collect($flat)->mapWithKeys(
            fn ($value, string $key) => [Str::after($key, $prefix) => $value]
        )->all();
    }

    /**
     * The reverse of stripPrefix(): nested validated input back into the
     * flat dot-keyed shape setMany() expects.
     */
    public function addPrefix(array $nested, string $prefix): array
    {
        return collect($nested)->mapWithKeys(
            fn ($value, string $key) => [$prefix.$key => $value]
        )->all();
    }

    public function careersEnabled(): bool
    {
        return ($this->all()[self::CAREERS_KEY] ?? null) === '1';
    }

    /** @return array<string, string|null> */
    private function all(): array
    {
        return Cache::rememberForever(
            self::CACHE_KEY,
            fn () => PortalSetting::pluck('value', 'key')->all(),
        );
    }
}
