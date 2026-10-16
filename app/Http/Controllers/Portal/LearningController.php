<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\PortalMaterialResource;
use App\Models\LearningMaterial;
use App\Services\Materials\LearningMaterialService;
use App\Services\Materials\VideoEmbed;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningController extends Controller
{
    public function __construct(private LearningMaterialService $service) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Portal/Learning/Index', [
            'materials' => PortalMaterialResource::collection(
                $this->service->portalIndex($request->user())
            )->resolve(),
        ]);
    }

    public function show(Request $request, LearningMaterial $learningMaterial): Response
    {
        $material = $this->service->findViewable($request->user(), $learningMaterial);

        abort_if($material === null, 403, 'This material is not available to you.');

        return Inertia::render('Portal/Learning/Show', [
            'material' => [
                'id' => $material->id,
                'title' => $material->title,
                'description' => $material->description,
                'type' => $material->type->value,
                // Uploads stream through our authorized route; link videos
                // only get a rebuilt embed source, never a stream URL.
                ...($material->isExternalLink()
                    ? ['embed' => VideoEmbed::fromUrl($material->external_url)]
                    : ['stream_url' => route('portal.learning.stream', $material)]),
            ],
        ]);
    }
}
