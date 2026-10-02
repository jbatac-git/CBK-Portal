<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Services\Settings\PortalSettingService;
use Inertia\Inertia;
use Inertia\Response;

class CareersController extends Controller
{
    public function __invoke(PortalSettingService $settings): Response
    {
        // Real backend guard — not just hiding the nav button. Someone
        // bookmarking or guessing this URL while the flag is off must
        // still be refused, the same principle we used everywhere else.
        abort_unless($settings->careersEnabled(), 404);

        return Inertia::render('Portal/Careers/Index');
    }
}