<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Department;
use Illuminate\Database\Seeder;

class LookupSeeder extends Seeder
{
    public function run(): void
    {
        Company::firstOrCreate(['name' => 'CBK Hardware, Inc.']);

        // Placeholder departments. Replace with the real list from the client.
        foreach (['Sales', 'Human Resources', 'IT', 'Operations'] as $name) {
            Department::firstOrCreate(['name' => $name]);
        }
    }
}