<?php

namespace App\Policies;

use App\Models\LearningMaterial;
use App\Models\User;

class LearningMaterialPolicy
{
    public function viewAny(User $user): bool { return $user->can('learning-materials.view'); }
    public function create(User $user): bool { return $user->can('learning-materials.create'); }
    public function update(User $user, LearningMaterial $material): bool { return $user->can('learning-materials.update'); }
    public function archive(User $user, LearningMaterial $material): bool { return $user->can('learning-materials.archive'); }

    /**
     * The Diser-side viewing/streaming rule. Checked on EVERY stream
     * request, not only when the index page is rendered — otherwise a
     * guessed or bookmarked URL could bypass the temporary-access lock.
     */
    public function view(User $user, LearningMaterial $material): bool
    {
        return $user->can('portal.learning')
            && $material->status->value === 'published'
            && ! $material->isLockedFor($user);
    }
}