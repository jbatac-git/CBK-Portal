<?php

namespace Database\Seeders;

use App\Enums\AccountStatus;
use App\Enums\RoleName;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        // Demo accounts with a known password must NEVER exist outside local.
        if (! app()->environment('local')) {
            return;
        }

        $company = Company::query()->firstOrFail();

        $accounts = [
            ['first_name' => 'System', 'last_name' => 'Admin', 'employee_id' => '100000',
                'username' => 'sadmin00', 'email' => 'superadmin@cbk.test', 'role' => RoleName::SuperAdmin],
            ['first_name' => 'Alma', 'last_name' => 'Cruz', 'employee_id' => '100002',
                'username' => 'acruz02', 'email' => 'admin@cbk.test', 'role' => RoleName::Admin],
            ['first_name' => 'Carla', 'last_name' => 'Tan', 'employee_id' => '100003',
                'username' => 'ctan03', 'email' => 'hr@cbk.test', 'role' => RoleName::Hr],
            ['first_name' => 'Jhonel', 'middle_name' => 'Ganal', 'last_name' => 'Batac', 'employee_id' => '100001',
                'username' => 'jbatac01', 'email' => 'diser@cbk.test', 'role' => RoleName::Diser],
        ];

        foreach ($accounts as $account) {
            $role = $account['role'];
            unset($account['role']);

            $user = User::updateOrCreate(
                ['username' => $account['username']],
                [
                    ...$account,
                    'password' => 'password',
                    'company_id' => $company->id,
                    'status' => AccountStatus::Active,
                ],
            );

            $user->syncRoles([$role->value]);

            if ($role === RoleName::Diser) {
                $user->syncPermissions(['portal.learning', 'portal.price-lists', 'portal.contact-us']);
            }
        }
    }
}