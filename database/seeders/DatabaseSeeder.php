<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Order matters: roles and lookups must exist before users.
       $this->call([
    RolePermissionSeeder::class,
    LookupSeeder::class,
    DemoUserSeeder::class,
    LearningMaterialSeeder::class,
]);
    }
}