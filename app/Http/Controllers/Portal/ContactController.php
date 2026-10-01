<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Services\Settings\PortalSettingService;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __invoke(PortalSettingService $settings): Response
    {
        return Inertia::render('Portal/Contact/Index', [
            'contact' => $settings->getMany(PortalSettingService::CONTACT_KEYS),
        ]);
    }
}