<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateContactUsRequest;
use App\Services\Settings\PortalSettingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactUsController extends Controller
{
    public function __construct(private PortalSettingService $settings) {}

    public function edit(): Response
    {
        return Inertia::render('Admin/Settings/ContactUs', [
            'contact' => $this->settings->stripPrefix(
                $this->settings->getMany(PortalSettingService::CONTACT_KEYS),
                'contact.',
            ),
        ]);
    }

    public function update(UpdateContactUsRequest $request): RedirectResponse
    {
        $this->settings->setMany(
            $this->settings->addPrefix($request->validated('contact'), 'contact.')
        );

        return back()->with('success', 'Contact information updated.');
    }
}