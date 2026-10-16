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
        $user = $request->user();

        // Home is open to every Diser, but the materials preview is part of
        // the Learning module and must follow the same per-user permission.
        $materials = $user->can('portal.learning')
            ? PortalMaterialResource::collection($this->service->portalIndex($user))->resolve()
            : [];

        return Inertia::render('Portal/Home', [
            'materials' => $materials,
        ]);
    }
}
