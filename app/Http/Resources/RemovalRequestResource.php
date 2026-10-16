<?php

namespace App\Http\Resources;

use App\Models\RemovalRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin RemovalRequest */
class RemovalRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee' => $this->user->name,
            'username' => $this->user->username,
            'reason' => $this->reason?->name ?? '—',
            'details' => $this->details,
            'requested_by' => $this->requester->name,
            'requested_at' => $this->created_at->toIso8601String(),
            'can_process' => $request->user()?->can('process', $this->resource) ?? false,
        ];
    }
}
