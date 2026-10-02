<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Services\Settings\PortalSettingService;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';
    public function __construct(private PortalSettingService $settings) {}
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'first_name' => $user->first_name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames()->values(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->values(),
                    'status' => $user->status->value,
                    'is_temporary' => $user->isRestrictedToInitialMaterials(),
                    'temporary_days_left' => $user->temporaryDaysLeft(),
                    'profile_photo_url' => $user->profilePhotoUrl(),
                ] : null,
            ],
            'branding' => [
                'logo_url' => $this->settings->logoUrl(),
                'footer' => $this->settings->stripPrefix(
                    $this->settings->getMany(\App\Services\Settings\PortalSettingService::FOOTER_KEYS),
                    'footer.',
                ),
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            'features' => [
                'careers_enabled' => $this->settings->careersEnabled(),
            ],
        ];
    }
}
