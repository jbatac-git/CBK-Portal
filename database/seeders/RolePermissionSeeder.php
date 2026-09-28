<?php

namespace Database\Seeders;

use App\Enums\RoleName;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /** Single source of truth for every permission in the system. */
    protected array $permissions = [
        // Portal entry points
        'admin.access',
        'portal.access',

        // Admin modules
        'users.view', 'users.create', 'users.update',
        'users.approve', 'users.deactivate', 'users.request-removal', 'users.manage-access',
        'learning-materials.view', 'learning-materials.create',
        'learning-materials.update', 'learning-materials.archive',
        'price-lists.view', 'price-lists.create',
        'price-lists.update', 'price-lists.archive',
        'contact-us.manage',
        'settings.manage', 'roles.manage',

        // Diser modules (assigned directly per employee, NOT via the role)
        'portal.learning', 'portal.price-lists', 'portal.contact-us',
    ];

    public function run(): void
    {
        // Spatie caches permissions; clear it so the seeder always sees fresh data.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ($this->permissions as $name) {
            Permission::firstOrCreate(['name' => $name]);
        }

        Role::firstOrCreate(['name' => RoleName::SuperAdmin->value])
            ->syncPermissions(Permission::all());

        Role::firstOrCreate(['name' => RoleName::Admin->value])->syncPermissions([
            'admin.access',
            'users.view', 'users.create', 'users.update',
            'users.approve', 'users.deactivate', 'users.manage-access',
            'learning-materials.view', 'learning-materials.create',
            'learning-materials.update', 'learning-materials.archive',
            'price-lists.view', 'price-lists.create',
            'price-lists.update', 'price-lists.archive',
            'contact-us.manage',
        ]);

        Role::firstOrCreate(['name' => RoleName::Hr->value])->syncPermissions([
            'admin.access',
            'users.view', 'users.create', 'users.update',
            'users.approve', 'users.request-removal',
        ]);

        // Diser only gets the base entry permission. Modules are per-employee.
        Role::firstOrCreate(['name' => RoleName::Diser->value])->syncPermissions([
            'portal.access',
        ]);
    }
}