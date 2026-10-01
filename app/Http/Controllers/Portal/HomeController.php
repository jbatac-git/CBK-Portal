<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\PortalMaterialResource;
use App\Services\Materials\LearningMaterialService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(private LearningMaterialService $service) {}

    public function __invoke(Request $request): Response
    {
        return Inertia::render('Portal/Home', [
            'materials' => PortalMaterialResource::collection(
                $this->service->portalIndex($request->user())
            )->resolve(),
        ]);
    }
}