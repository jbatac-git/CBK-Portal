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
        // Stored internally as dot-prefixed keys; the form only ever sees flat field names.
        $stored = $this->settings->getMany(PortalSettingService::CONTACT_KEYS);

        return Inertia::render('Admin/Settings/ContactUs', [
            'contact' => [
                'headline' => $stored['contact.headline'],
                'phone' => $stored['contact.phone'],
                'email' => $stored['contact.email'],
                'website' => $stored['contact.website'],
                'location' => $stored['contact.location'],
            ],
        ]);
    }

    public function update(UpdateContactUsRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $this->settings->setMany([
            'contact.headline' => $data['headline'],
            'contact.phone' => $data['phone'],
            'contact.email' => $data['email'],
            'contact.website' => $data['website'] ?? null,
            'contact.location' => $data['location'] ?? null,
        ]);

        return back()->with('success', 'Contact information updated.');
    }
}