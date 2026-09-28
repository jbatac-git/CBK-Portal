<?php

namespace App\Policies;

use App\Enums\RoleName;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('users.view');
    }

    public function create(User $actor): bool
    {
        return $actor->can('users.create');
    }

    /**
     * Two checks, and BOTH must pass:
     * 1) the general capability (permission), and
     * 2) this specific target is ranked below the actor (hierarchy).
     */
    public function update(User $actor, User $target): bool
    {
        return $actor->can('users.update') && $this->outranks($actor, $target);
    }

    private function outranks(User $actor, User $target): bool
    {
        if ($actor->hasRole(RoleName::SuperAdmin->value)) {
            return true;
        }

        return RoleName::rankOf($actor) > RoleName::rankOf($target);
    }
}