<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MaterialStatus;
use App\Http\Controllers\Concerns\RedirectsWithDomainErrors;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LearningMaterials\StoreMaterialRequest;
use App\Http\Requests\Admin\LearningMaterials\UpdateMaterialRequest;
use App\Http\Resources\LearningMaterialResource;
use App\Models\LearningMaterial;
use App\Services\Materials\LearningMaterialService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningMaterialController extends Controller
{
    use RedirectsWithDomainErrors;

    public function __construct(private LearningMaterialService $service) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', LearningMaterial::class);

        $materials = $this->service->list(
            $request->string('search')->toString() ?: null,
            $request->string('status')->toString() ?: null,
            $request->integer('category') ?: null,
        );

        return Inertia::render('Admin/LearningMaterials/Index', [
            'materials' => $materials->through(fn (LearningMaterial $m) => LearningMaterialResource::make($m)->resolve()),
            'filters' => $request->only('search', 'status', 'category'),
            'categories' => $this->service->formOptions()['categories'],
            'statuses' => collect(MaterialStatus::cases())
                ->map(fn (MaterialStatus $s) => ['value' => $s->value, 'label' => $s->label()])->values(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', LearningMaterial::class);

        return Inertia::render('Admin/LearningMaterials/Create', $this->service->formOptions());
    }

    public function store(StoreMaterialRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $file = $request->file('file');
        unset($data['file']);

        $this->service->create($data, $file, $request->user());

        return redirect()->route('admin.learning-materials.index')->with('success', 'Learning material uploaded.');
    }

    public function edit(LearningMaterial $learningMaterial): Response
    {
        $this->authorize('update', $learningMaterial);

        return Inertia::render('Admin/LearningMaterials/Edit', [
            'material' => LearningMaterialResource::make($learningMaterial)->resolve(),
            ...$this->service->formOptions(),
        ]);
    }

    public function update(UpdateMaterialRequest $request, LearningMaterial $learningMaterial): RedirectResponse
    {
        $data = $request->validated();
        $file = $request->file('file');
        unset($data['file']);

        return $this->attempt(
            fn () => $this->service->update($learningMaterial, $data, $file),
            "'{$learningMaterial->title}' updated.",
        );
    }

    public function archive(LearningMaterial $learningMaterial): RedirectResponse
    {
        $this->authorize('archive', $learningMaterial);

        return $this->attempt(
            fn () => $this->service->archive($learningMaterial),
            "'{$learningMaterial->title}' archived.",
        );
    }
}