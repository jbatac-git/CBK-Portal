<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateBrandingRequest;
use App\Services\Media\ImageService;
use App\Services\Settings\PortalSettingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(
        private PortalSettingService $settings,
        private ImageService $images,
    ) {}

    public function edit(): Response
    {
        return Inertia::render('Admin/Settings/Edit', [
            'footer' => $this->settings->getMany(PortalSettingService::FOOTER_KEYS),
            'logo_url' => $this->settings->logoUrl(),
        ]);
    }

    public function update(UpdateBrandingRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $logo = $request->file('logo');
        unset($data['logo']);

        $this->settings->setMany($data);

        if ($logo) {
            $old = $this->settings->getMany([PortalSettingService::LOGO_KEY])[PortalSettingService::LOGO_KEY];

            $path = $this->images->storeResized($logo, 'branding', config('portal.logo.width'), config('portal.logo.height'));
            $this->settings->setMany([PortalSettingService::LOGO_KEY => $path]);

            $this->images->delete($old ?: null);
        }

        return back()->with('success', 'Portal settings updated.');
    }
}