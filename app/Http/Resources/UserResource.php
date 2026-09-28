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
        $daysLeft = null;

        if ($this->status === AccountStatus::Temporary && $this->temporary_access_expires_at) {
            $daysLeft = max(0, (int) ceil(now()->diffInDays($this->temporary_access_expires_at, false)));
        }

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
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'temporary_days_left' => $daysLeft,
            // Only present when the controller loaded `permissions` (edit page).
            'modules' => $this->whenLoaded(
                'permissions',
                fn () => $this->permissions->pluck('name')->values(),
            ),
            // Lets React hide the Edit button using the SAME Policy as the backend.
            'can_update' => $request->user()?->can('update', $this->resource) ?? false,
        ];
    }
}