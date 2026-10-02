<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateBrandingRequest;
use App\Services\Media\ImageService;
use App\Services\Settings\PortalSettingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function __construct(
        private PortalSettingService $settings,
        private ImageService $images,
    ) {}

    public function edit(): Response
    {
        return Inertia::render('Admin/Settings/Edit', [
            'footer' => $this->settings->stripPrefix(
                $this->settings->getMany(PortalSettingService::FOOTER_KEYS),
                'footer.',
            ),
            'logo_url' => $this->settings->logoUrl(),
        ]);
    }

    public function update(UpdateBrandingRequest $request): RedirectResponse
    {
        $this->settings->setMany(
            $this->settings->addPrefix($request->validated('footer'), 'footer.')
        );

        $logo = $request->file('logo');

        if ($logo) {
            $old = $this->settings->getMany([PortalSettingService::LOGO_KEY])[PortalSettingService::LOGO_KEY];

            $path = $this->images->storeResized($logo, 'branding', config('portal.logo.width'), config('portal.logo.height'));
            $this->settings->setMany([PortalSettingService::LOGO_KEY => $path]);

            $this->images->delete($old ?: null);
        }

        return back()->with('success', 'Portal settings updated.');
    }
    public function updateCareersFlag(Request $request): RedirectResponse
    {
        $this->authorize('settings.manage'); // defense in depth; the route is already gated

        $validated = $request->validate(['careers_enabled' => ['required', 'boolean']]);

        $this->settings->setMany([
            PortalSettingService::CAREERS_KEY => $validated['careers_enabled'] ? '1' : '0',
        ]);

        return back()->with('success', 'Careers module setting updated.');
    }
}
