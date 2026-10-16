<?php

namespace App\Models;

use App\Enums\RemovalRequestStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class RemovalRequest extends Model
{
    use SoftDeletes;

    // status / processed_* / decision_note are NOT fillable: only services change them.
    protected $fillable = ['user_id', 'requested_by', 'removal_reason_id', 'details'];

    protected function casts(): array
    {
        return [
            'status' => RemovalRequestStatus::class,
            'processed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    // Explicit foreign key: Eloquent would otherwise guess "reason_id".
    public function reason(): BelongsTo
    {
        // withTrashed: a reason deleted later must still label the requests that used it.
        return $this->belongsTo(RemovalReason::class, 'removal_reason_id')->withTrashed();
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', RemovalRequestStatus::Pending->value);
    }
}
