<?php

namespace App\Policies;

use App\Models\RemovalRequest;
use App\Models\User;

class RemovalRequestPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('users.deactivate');
    }

    /** Whoever may deactivate the target may process the request about them. */
    public function process(User $actor, RemovalRequest $request): bool
    {
        return $actor->can('deactivate', $request->user);
    }
}