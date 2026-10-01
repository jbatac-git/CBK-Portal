<?php

namespace App\Models;

use App\Enums\AccountStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use App\Enums\RemovalRequestStatus;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'username',
        'employee_id',
        'email',
        'contact_number',
        'password',
        'company_id',
        'department_id',
        'status',
        'profile_photo_path',
        'temporary_access_expires_at',
        'must_change_password',
        'status_changed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => AccountStatus::class,
            'temporary_access_expires_at' => 'datetime',
            'must_change_password' => 'boolean',
            'status_changed_at' => 'datetime',
        ];
    }
    /**
     * Full display name, e.g. "Jhonel Ganal Batac".
     * Computed, so there is no duplicated data to keep in sync.
     */
    protected function name(): Attribute
    {
        return Attribute::get(fn() => implode(' ', array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ])));
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * The single rule that decides whether this account may use the portal.
     * Used by the login request AND the per-request middleware, so the
     * rule lives in exactly one place.
     */
    public function hasPortalAccess(): bool
    {
        return match ($this->status) {
            AccountStatus::Active => true,
            AccountStatus::Temporary => $this->temporary_access_expires_at?->isFuture() ?? false,
            default => false,
        };
    }

    public function pendingRemovalRequest(): HasOne
    {
        return $this->hasOne(RemovalRequest::class)
            ->where('status', RemovalRequestStatus::Pending->value);
    }

    /** Whole days left in the temporary period, or null when not applicable. */
    public function temporaryDaysLeft(): ?int
    {
        if ($this->status !== AccountStatus::Temporary || ! $this->temporary_access_expires_at) {
            return null;
        }

        return max(0, (int) ceil(now()->diffInDays($this->temporary_access_expires_at, false)));
    }

    /**
     * Temporary accounts on the Diser side may only reach the initial learning
     * materials. Admin-side accounts (HR/Admin) keep their admin tools.
     */
    public function isRestrictedToInitialMaterials(): bool
    {
        return $this->status === AccountStatus::Temporary && ! $this->can('admin.access');
    }
    /** Null when no custom photo was uploaded; the frontend falls back to initials. */
    public function profilePhotoUrl(): ?string
    {
        return $this->profile_photo_path
            ? \Illuminate\Support\Facades\Storage::disk('public')->url($this->profile_photo_path)
            : null;
    }
}
