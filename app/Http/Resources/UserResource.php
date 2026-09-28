<?php

namespace App\Http\Resources;

use App\Enums\AccountStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $actor = $request->user();
        $status = $this->status;
        $pendingRemoval = $this->pendingRemovalRequest !== null;

        $can = fn (string $ability): bool => $actor?->can($ability, $this->resource) ?? false;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'username' => $this->username,
            'employee_id' => $this->employee_id,
            'email' => $this->email,
            'company_id' => $this->company_id,
            'department_id' => $this->department_id,
            'company' => $this->company?->name,
            'department' => $this->department?->name,
            'role' => $this->roles->first()?->name,
            'status' => $status->value,
            'status_label' => $status->label(),
            'temporary_days_left' => $this->temporaryDaysLeft(),
            'has_pending_removal' => $pendingRemoval,
            'modules' => $this->whenLoaded(
                'permissions',
                fn () => $this->permissions->pluck('name')->values(),
            ),

            // Abilities: permission + hierarchy (Policy) AND a legal state change.
            'can_update' => $can('update'),
            'can_approve' => $status->canTransitionTo(AccountStatus::Active) && $can('approve'),
            'can_decline' => $status === AccountStatus::Temporary && $can('approve'),
            'can_deactivate' => $status->canTransitionTo(AccountStatus::Deactivated) && $can('deactivate'),
            // Whoever can deactivate directly never needs to send a request.
            'can_request_removal' => ! $pendingRemoval
                && $status->canTransitionTo(AccountStatus::Deactivated)
                && $can('requestRemoval')
                && ! $can('deactivate'),
            'can_resend_credentials' => $status === AccountStatus::Temporary
                && $this->must_change_password
                && $can('resendCredentials'),
        ];
    }
}