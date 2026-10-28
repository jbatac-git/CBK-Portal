<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\RedirectsWithDomainErrors;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LearningMaterialCategories\StoreCategoryRequest;
use App\Http\Requests\Admin\LearningMaterialCategories\UpdateCategoryRequest;
use App\Models\LearningMaterialCategory;
use App\Services\Materials\LearningMaterialCategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningMaterialCategoryController extends Controller
{
    use RedirectsWithDomainErrors;

    public function __construct(private LearningMaterialCategoryService $service) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', LearningMaterialCategory::class);

        return Inertia::render('Admin/LearningMaterialCategories/Index', [
            'categories' => $this->service->list($request->string('search')->toString() ?: null),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return back(fallback: route('admin.learning-material-categories.index'))->with('success', 'Category created.');
    }

    public function update(UpdateCategoryRequest $request, LearningMaterialCategory $learningMaterialCategory): RedirectResponse
    {
        $this->service->update($learningMaterialCategory, $request->validated());

        return back(fallback: route('admin.learning-material-categories.index'))->with('success', 'Category updated.');
    }

    public function destroy(LearningMaterialCategory $learningMaterialCategory): RedirectResponse
    {
        $this->authorize('delete', $learningMaterialCategory);

        return $this->attempt(
            fn () => $this->service->delete($learningMaterialCategory),
            'Category deleted.',
        );
    }
}
