<?php

namespace App\Console\Commands;

use App\Enums\AccountStatus;
use App\Enums\RoleName;
use App\Models\Company;
use App\Models\Department;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

/**
 * Creates a Super Admin from the command line, for a new server where nobody
 * can log in yet (the demo accounts only exist on local). The password is typed
 * hidden, never passed as an argument, and must be changed on first login.
 */
class CreateSuperAdmin extends Command
{
    protected $signature = 'portal:create-super-admin';

    protected $description = 'Create a Super Admin account (for a new server)';

    public function handle(): int
    {
        $companies = Company::query()->where('is_active', true)->orderBy('name')->pluck('name', 'id');
        $departments = Department::query()->where('is_active', true)->orderBy('name')->pluck('name', 'id');

        if ($companies->isEmpty() || $departments->isEmpty()) {
            $this->error('Add a company and a department first: php artisan db:seed --class=LookupSeeder --force');

            return self::FAILURE;
        }

        $data = [
            'username' => Str::lower(trim((string) $this->ask('Username (used to log in)'))),
            'first_name' => trim((string) $this->ask('First name')),
            'last_name' => trim((string) $this->ask('Last name')),
            'email' => trim((string) $this->ask('Email')),
            'employee_id' => Str::upper(preg_replace('/\s+/', ' ', trim((string) $this->ask('Employee ID')))),
            'company_id' => $companies->search($this->choice('Company', $companies->values()->all(), 0)),
            'department_id' => $departments->search($this->choice('Department', $departments->values()->all(), 0)),
            'password' => (string) $this->secret('Password'),
            'password_confirmation' => (string) $this->secret('Type the password again'),
        ];

        $validator = Validator::make($data, [
            'username' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[a-z0-9]+$/', 'unique:users,username'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'employee_id' => ['required', 'string', 'max:30', 'regex:/^[A-Z0-9][A-Z0-9\-\/. ]*$/', 'unique:users,employee_id'],
            'company_id' => ['required', 'integer'],
            'department_id' => ['required', 'integer'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'username.regex' => 'Username can only contain letters and numbers.',
            'employee_id.regex' => 'Employee ID can only contain letters, numbers, spaces, and - / .',
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        $user = DB::transaction(function () use ($validator) {
            $user = User::create([
                ...$validator->validated(), // the password is hashed by the model cast
                'status' => AccountStatus::Active,
                'must_change_password' => true,
            ]);

            $user->assignRole(RoleName::SuperAdmin->value);

            return $user;
        });

        $this->info("Super Admin created. Log in as \"{$user->username}\"; the portal asks for a new password on first login.");

        return self::SUCCESS;
    }
}
