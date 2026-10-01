<?php

namespace App\Services\Materials;

use App\Models\LearningMaterialCategory;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class LearningMaterialCategoryService
{
    public function list(?string $search, int $perPage = 15): LengthAwarePaginator
    {
        return LearningMaterialCategory::query()
            ->when($search, fn ($q) => $q->where('name', 'ilike', "%{$search}%"))
            ->withCount('materials')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function activeOptions(): Collection
    {
        return LearningMaterialCategory::active()->orderBy('name')->get(['id', 'name']);
    }

    public function create(array $data): LearningMaterialCategory
    {
        return LearningMaterialCategory::create($data);
    }

    public function update(LearningMaterialCategory $category, array $data): LearningMaterialCategory
    {
        $category->update($data);

        return $category->fresh();
    }

    public function delete(LearningMaterialCategory $category): void
    {
        if ($category->materials()->exists()) {
            throw new DomainException(
                'This category cannot be deleted because it still has learning materials assigned to it.'
            );
        }

        $category->delete();
    }
}