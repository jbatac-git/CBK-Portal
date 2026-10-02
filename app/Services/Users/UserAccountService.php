<?php

namespace App\Services\Users;

use App\Enums\AccountStatus;
use App\Enums\PortalModule;
use App\Enums\RoleName;
use App\Mail\TemporaryAccessMail;
use App\Models\Company;
use App\Models\Department;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use DomainException;

class UserAccountService
{
    public function __construct(
        private UsernameGenerator $usernames,
        private SessionRevoker $sessions,
    ) {}

    /**
     * Employees the actor is allowed to see: only accounts ranked below them
     * (Super Admin sees everyone).
     */
    public function list(User $actor, ?string $search, ?string $status, int $perPage = 15): LengthAwarePaginator
    {
        $assignable = RoleName::assignableBy($actor);

        $hiddenRoles = collect(RoleName::cases())
            ->reject(fn(RoleName $role) => in_array($role, $assignable, true))
            ->map(fn(RoleName $role) => $role->value)
            ->values()
            ->all();

        return User::query()
            ->with(['roles', 'company', 'department', 'pendingRemovalRequest'])   // eager load: avoids N+1
            ->when($hiddenRoles, fn(Builder $q) => $q->whereDoesntHave(
                'roles',
                fn(Builder $roles) => $roles->whereIn('name', $hiddenRoles),
            ))
            ->when($status, fn(Builder $q) => $q->where('status', $status))
            ->when($search, function (Builder $q) use ($search) {
                $term = '%' . $search . '%';

                // The extra closure GROUPS the OR conditions. Without it, the
                // "or" would escape and ignore the status / role filters above.
                $q->where(function (Builder $q) use ($term) {
                    $q->whereRaw("concat_ws(' ', first_name, middle_name, last_name) ilike ?", [$term])
                        ->orWhere('username', 'ilike', $term)
                        ->orWhere('employee_id', 'ilike', $term)
                        ->orWhere('email', 'ilike', $term);
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($perPage)
            ->withQueryString();
    }

    /** Dropdown data for the create/edit form. */
    public function formOptions(User $actor): array
    {
        return [
            'companies' => Company::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'departments' => Department::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'roles' => collect(RoleName::assignableBy($actor))
                ->map(fn(RoleName $role) => ['value' => $role->value, 'label' => $role->value])
                ->values(),
            'modules' => collect(PortalModule::cases())
                ->map(fn(PortalModule $m) => ['value' => $m->value, 'label' => $m->label()])
                ->values(),
            'default_modules' => PortalModule::defaults(),
            'can_manage_access' => $actor->can('users.manage-access'),
            'temporary_access_days' => config('portal.temporary_access_days'),
        ];
    }

    /**
     * Creates a TEMPORARY account, assigns role + modules, then emails credentials.
     */
    public function create(array $data, User $actor): User
    {
        $role = RoleName::from($data['role']);

        // Defense in depth: the Form Request already validated this.
        if (! in_array($role, RoleName::assignableBy($actor), true)) {
            throw new AuthorizationException('You are not allowed to assign this role.');
        }

        $temporaryPassword = $this->generateTemporaryPassword();

        // All-or-nothing: a user without a role would be a half-created account.
        $user = DB::transaction(function () use ($data, $role, $actor, $temporaryPassword) {
            $user = User::create([
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'employee_id' => $data['employee_id'],
                'email' => $data['email'],
                'company_id' => $data['company_id'],
                'department_id' => $data['department_id'] ?? null,
                'username' => $this->usernames->generate(
                    $data['first_name'],
                    $data['last_name'],
                    $data['employee_id'],
                ),
                'password' => $temporaryPassword, // hashed by the model cast
                'status' => AccountStatus::Temporary,
                'must_change_password' => true,
                'temporary_access_expires_at' => now()->addDays(config('portal.temporary_access_days')),
            ]);

            $user->assignRole($role->value);
            $this->syncModules($user, $role, $data['modules'] ?? null, $actor, useDefaults: true);

            return $user;
        });

        // Outside the transaction: the queue worker must never run before the
        // user row is actually committed.
        Mail::to($user->email)->queue(new TemporaryAccessMail($user, $temporaryPassword));

        return $user;
    }

    /**
     * Updates profile data and (if the actor may) the Diser's modules.
     * Role, username and employee ID are intentionally NOT editable here.
     */
    public function update(User $user, array $data, User $actor): User
    {
        DB::transaction(function () use ($user, $data, $actor) {
            $user->update([
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'company_id' => $data['company_id'],
                'department_id' => $data['department_id'] ?? null,
            ]);

            $role = RoleName::tryFrom($user->getRoleNames()->first() ?? '');

            $this->syncModules(
                $user,
                $role,
                array_key_exists('modules', $data) ? ($data['modules'] ?? []) : null,
                $actor,
                useDefaults: false,
            );
        });

        return $user->fresh();
    }

    /**
     * Module access exists only for Disers, and only users with
     * `users.manage-access` may choose it. Everyone else gets the defaults
     * on create and cannot touch it on update.
     */
    private function syncModules(User $user, ?RoleName $role, ?array $requested, User $actor, bool $useDefaults): void
    {
        if ($role !== RoleName::Diser) {
            return;
        }

        $defaults = $useDefaults ? PortalModule::defaults() : null;

        $modules = $actor->can('users.manage-access')
            ? ($requested ?? $defaults)
            : $defaults;

        if ($modules === null) {
            return; // nothing to change
        }

        // Whitelist again: only real portal modules can ever be assigned here.
        $user->syncPermissions(array_values(array_intersect($modules, PortalModule::values())));
    }

    private function generateTemporaryPassword(): string
    {
        // No 0/O/1/l/I: people read this off an email and type it on a phone.
        $alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        $max = strlen($alphabet) - 1;
        $password = '';

        for ($i = 0; $i < config('portal.temporary_password_length'); $i++) {
            $password .= $alphabet[random_int(0, $max)]; // cryptographically secure
        }

        return $password;
    }

    /**
     * Generates a NEW temporary password. Only allowed while the employee has
     * never set their own password and the 7 days have not ended. It does NOT
     * extend the temporary period.
     */
    public function resendCredentials(User $user): void
    {
        if ($user->status !== AccountStatus::Temporary || ! $user->must_change_password) {
            throw new DomainException(
                'Credentials can only be re-sent to a temporary account that has not set its own password yet.'
            );
        }

        if (! $user->temporary_access_expires_at?->isFuture()) {
            throw new DomainException('The temporary access period has already ended.');
        }

        $temporaryPassword = $this->generateTemporaryPassword();

        DB::transaction(function () use ($user, $temporaryPassword) {
            $user->forceFill(['password' => $temporaryPassword])->save(); // hashed by the cast
            $this->sessions->revoke($user); // the old password must stop working everywhere
        });

        Mail::to($user->email)->queue(new TemporaryAccessMail($user, $temporaryPassword));
    }

    /** Also used by the Profile page in Phase 5. Clears the "must change" flag. */
    public function changePassword(User $user, string $newPassword): void
    {
        $user->forceFill([
            'password' => $newPassword,
            'must_change_password' => false,
        ])->save();
    }
}
