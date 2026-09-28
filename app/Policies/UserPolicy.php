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

    public function update(User $actor, User $target): bool
    {
        return $actor->can('users.update') && $this->outranks($actor, $target);
    }

    public function resendCredentials(User $actor, User $target): bool
    {
        return $actor->can('users.update') && $this->outranks($actor, $target);
    }

    public function approve(User $actor, User $target): bool
    {
        return $actor->can('users.approve') && $this->canManageLifecycle($actor, $target);
    }

    public function deactivate(User $actor, User $target): bool
    {
        return $actor->can('users.deactivate') && $this->canManageLifecycle($actor, $target);
    }

    public function requestRemoval(User $actor, User $target): bool
    {
        return $actor->can('users.request-removal') && $this->canManageLifecycle($actor, $target);
    }

    private function outranks(User $actor, User $target): bool
    {
        if ($actor->hasRole(RoleName::SuperAdmin->value)) {
            return true;
        }

        return RoleName::rankOf($actor) > RoleName::rankOf($target);
    }

    /**
     * Lifecycle actions are stricter than editing: nobody may approve,
     * restrict or deactivate THEIR OWN account. This stops a Super Admin
     * from locking themselves (and possibly everyone) out by accident.
     */
    private function canManageLifecycle(User $actor, User $target): bool
    {
        return $actor->isNot($target) && $this->outranks($actor, $target);
    }
}