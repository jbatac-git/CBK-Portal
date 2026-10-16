<?php

namespace App\Services\Users;

use App\Enums\AccountStatus;
use App\Enums\RemovalRequestStatus;
use App\Models\RemovalRequest;
use App\Models\User;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class RemovalRequestService
{
    public function __construct(private AccountLifecycleService $lifecycle) {}

    /** Oldest first: the longest-waiting request gets handled first. */
    public function pending(): Collection
    {
        return RemovalRequest::pending()->with(['user', 'requester'])->oldest()->get();
    }

    public function submit(User $user, User $actor, array $data): RemovalRequest
    {
        if ($user->status === AccountStatus::Deactivated) {
            throw new DomainException('This account is already deactivated.');
        }

        if ($user->pendingRemovalRequest()->exists()) {
            throw new DomainException('A removal request for this employee is already pending.');
        }

        try {
            return RemovalRequest::create([
                'user_id' => $user->id,
                'requested_by' => $actor->id,
                'removal_reason_id' => $data['removal_reason_id'],
                'details' => $data['details'] ?? null,
            ]);
        } catch (UniqueConstraintViolationException) {
            // Two people clicked at the same instant. The check above passed for
            // both, but the partial unique index rejected the second one.
            throw new DomainException('A removal request for this employee is already pending.');
        }
    }

    public function approve(RemovalRequest $request, User $actor): void
    {
        DB::transaction(function () use ($request, $actor) {
            $locked = $this->lockPending($request);

            // Deactivating also marks this request as approved.
            $this->lifecycle->deactivate($locked->user, $actor);
        });
    }

    public function decline(RemovalRequest $request, User $actor, ?string $note): void
    {
        DB::transaction(function () use ($request, $actor, $note) {
            $this->lockPending($request)->forceFill([
                'status' => RemovalRequestStatus::Declined,
                'processed_by' => $actor->id,
                'processed_at' => now(),
                'decision_note' => $note,
            ])->save();
        });
    }

    /**
     * Re-reads the request under a row lock so a concurrent approve and
     * decline cannot both pass the "still pending" check.
     */
    private function lockPending(RemovalRequest $request): RemovalRequest
    {
        $locked = RemovalRequest::query()->whereKey($request->getKey())->lockForUpdate()->firstOrFail();

        if ($locked->status !== RemovalRequestStatus::Pending) {
            throw new DomainException('This request has already been processed.');
        }

        return $locked;
    }
}
