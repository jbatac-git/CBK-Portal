<?php

namespace App\Services\Users;

use App\Enums\AccountStatus;
use App\Enums\RemovalRequestStatus;
use App\Models\RemovalRequest;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;

class AccountLifecycleService
{
    public function __construct(private SessionRevoker $sessions) {}

    /** Temporary or Restricted -> Active. The expiry no longer applies, so clear it. */
    public function approve(User $user, User $actor): User
    {
        return $this->transition($user, AccountStatus::Active, $actor, [
            'temporary_access_expires_at' => null,
        ]);
    }

    /** "Not approve": Temporary -> Restricted. */
    public function decline(User $user, User $actor): User
    {
        return $this->restrict($user, $actor);
    }

    /**
     * Any live account -> Deactivated, effective immediately.
     * Everything happens in ONE transaction: it all succeeds or none of it does.
     */
    public function deactivate(User $user, User $actor): User
    {
        return DB::transaction(function () use ($user, $actor) {
            $this->transition($user, AccountStatus::Deactivated, $actor);
            $this->sessions->revoke($user);

            // Deactivating directly also closes any pending removal request.
            RemovalRequest::pending()->where('user_id', $user->id)->update([
                'status' => RemovalRequestStatus::Approved->value,
                'processed_by' => $actor->id,
                'processed_at' => now(),
            ]);

            return $user;
        });
    }

    /** Used by the scheduler. Returns how many accounts were restricted. */
    public function expireOverdue(): int
    {
        $count = 0;

        // chunkById pages by id, so changing `status` while looping
        // cannot make the loop skip rows (plain chunk() could).
        User::query()
            ->where('status', AccountStatus::Temporary->value)
            ->where('temporary_access_expires_at', '<=', now())
            ->chunkById(100, function ($users) use (&$count) {
                foreach ($users as $user) {
                    $this->restrict($user, null);
                    $count++;
                }
            });

        return $count;
    }

    private function restrict(User $user, ?User $actor): User
    {
        return DB::transaction(function () use ($user, $actor) {
            $this->transition($user, AccountStatus::Restricted, $actor);
            $this->sessions->revoke($user);

            return $user;
        });
    }

    /** Every status change in the whole app goes through this one method. */
    private function transition(User $user, AccountStatus $to, ?User $actor, array $extra = []): User
    {
        if (! $user->status->canTransitionTo($to)) {
            throw new DomainException(
                "An account that is {$user->status->label()} cannot be changed to {$to->label()}."
            );
        }

        $user->forceFill([
            ...$extra,
            'status' => $to,
            'status_changed_at' => now(),
            'status_changed_by' => $actor?->id,
        ])->save();

        return $user;
    }
}