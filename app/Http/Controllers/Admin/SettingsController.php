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
        $stored = $this->settings->getMany(PortalSettingService::FOOTER_KEYS);

        return Inertia::render('Admin/Settings/Edit', [
            'footer' => [
                'company_name' => $stored['footer.company_name'],
                'copyright' => $stored['footer.copyright'],
                'contact' => $stored['footer.contact'],
                'website' => $stored['footer.website'],
                'address' => $stored['footer.address'],
            ],
            'logo_url' => $this->settings->logoUrl(),
        ]);
    }

    public function update(UpdateBrandingRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $logo = $request->file('logo');
        unset($data['logo']);

        $this->settings->setMany([
            'footer.company_name' => $data['company_name'],
            'footer.copyright' => $data['copyright'] ?? null,
            'footer.contact' => $data['contact'] ?? null,
            'footer.website' => $data['website'] ?? null,
            'footer.address' => $data['address'] ?? null,
        ]);

        if ($logo) {
            $old = $this->settings->currentLogoPath();

            $path = $this->images->storeResized($logo, 'branding', config('portal.logo.width'), config('portal.logo.height'));
            $this->settings->setMany([PortalSettingService::LOGO_KEY => $path]);

            $this->images->delete($old);
        }

        return back()->with('success', 'Portal settings updated.');
    }
}