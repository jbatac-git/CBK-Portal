<?php

namespace App\Services\Settings;

use App\Enums\RoleName;
use DomainException;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionMatrixService
{
    /**
     * Only these permissions are toggleable in the UI. Deliberately excludes:
     * - admin.access / portal.access (the base entry permissions; removing
     *   these by accident would instantly lock a whole role out)
     * - settings.manage / roles.manage (reserved to Super Admin only, by design)
     * - portal.* module permissions (those are per-employee, assigned in
     *   User Management, NOT via this role matrix — see Phase 2 correction)
     */
    public const EDITABLE_PERMISSIONS = [
        'users.view', 'users.create', 'users.update', 'users.approve',
        'users.deactivate', 'users.request-removal', 'users.manage-access',
        'learning-materials.view', 'learning-materials.create',
        'learning-materials.update', 'learning-materials.archive',
        'price-lists.view', 'price-lists.create', 'price-lists.update', 'price-lists.archive',
        'contact-us.manage',
    ];

    /** Only these roles may be edited through this screen. */
    public const EDITABLE_ROLES = [RoleName::Admin, RoleName::Hr];

    public function matrix(): array
    {
        $editablePermissionNames = collect(self::EDITABLE_PERMISSIONS);

        $rows = collect(RoleName::cases())->map(function (RoleName $role) use ($editablePermissionNames) {
            $model = Role::where('name', $role->value)->first();
            $granted = $model?->permissions->pluck('name') ?? collect();

            return [
                'role' => $role->value,
                'editable' => in_array($role, self::EDITABLE_ROLES, true),
                'permissions' => $editablePermissionNames
                    ->mapWithKeys(fn (string $permission) => [$permission => $granted->contains($permission)])
                    ->all(),
            ];
        });

        return [
            'permissions' => $editablePermissionNames->values()->all(),
            'roles' => $rows->values()->all(),
        ];
    }

    public function update(RoleName $role, array $permissions): void
    {
        if (! in_array($role, self::EDITABLE_ROLES, true)) {
            throw new DomainException("The {$role->value} role cannot be edited from this screen.");
        }

        $invalid = array_diff($permissions, self::EDITABLE_PERMISSIONS);

        if (! empty($invalid)) {
            throw new DomainException('One or more selected permissions are not valid for this screen.');
        }

        $roleModel = Role::where('name', $role->value)->firstOrFail();

        // Base entry permission must never be lost through this screen.
        $base = $role === RoleName::Admin ? 'admin.access' : 'admin.access';
        $roleModel->syncPermissions([...$permissions, $base]);

        // Safety net: Super Admin must always keep every permission,
        // no matter what else happens on this page.
        Role::where('name', RoleName::SuperAdmin->value)->first()?->syncPermissions(Permission::all());
    }
}