<?php

namespace App\Policies;

use App\Models\LearningMaterialCategory;
use App\Models\User;

class LearningMaterialCategoryPolicy
{
    public function viewAny(User $user): bool { return $user->can('learning-materials.view'); }
    public function create(User $user): bool { return $user->can('learning-materials.create'); }
    public function update(User $user, LearningMaterialCategory $category): bool { return $user->can('learning-materials.update'); }
    public function delete(User $user, LearningMaterialCategory $category): bool { return $user->can('learning-materials.update'); }
}