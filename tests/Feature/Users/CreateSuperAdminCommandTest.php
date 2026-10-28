<?php

namespace Tests\Feature\Users;

use App\Enums\AccountStatus;
use App\Enums\RoleName;
use App\Models\Company;
use App\Models\User;
use Database\Seeders\LookupSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Testing\PendingCommand;
use Tests\TestCase;

class CreateSuperAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolePermissionSeeder::class, LookupSeeder::class]);
    }

    private function runCommand(string $username, string $password, string $confirmation): PendingCommand
    {
        return $this->artisan('portal:create-super-admin')
            ->expectsQuestion('Username (used to log in)', $username)
            ->expectsQuestion('First name', 'Portal')
            ->expectsQuestion('Last name', 'Owner')
            ->expectsQuestion('Email', 'owner@example.com')
            ->expectsQuestion('Employee ID', ' it-0001 ')
            ->expectsChoice('Company', 'CBK Hardware, Inc.', ['CBK Hardware, Inc.'])
            ->expectsChoice('Department', 'IT', ['Human Resources', 'IT', 'Operations', 'Sales'])
            ->expectsQuestion('Password', $password)
            ->expectsQuestion('Type the password again', $confirmation);
    }

    public function test_it_creates_an_active_super_admin_who_must_change_the_password(): void
    {
        $this->runCommand('ITAdmin', 'first-login-9', 'first-login-9')->assertSuccessful();

        $user = User::where('username', 'itadmin')->firstOrFail();

        $this->assertTrue($user->hasRole(RoleName::SuperAdmin->value));
        $this->assertSame(AccountStatus::Active, $user->status);
        $this->assertTrue($user->must_change_password);
        $this->assertSame('IT-0001', $user->employee_id);
        $this->assertSame('IT', $user->department->name);
        $this->assertTrue(Hash::check('first-login-9', $user->password));

        $this->post(route('login'), ['username' => 'ITADMIN', 'password' => 'first-login-9'])
            ->assertRedirect();
        $this->assertAuthenticatedAs($user);
    }

    public function test_it_creates_nothing_when_the_passwords_do_not_match(): void
    {
        $this->runCommand('itadmin', 'first-login-9', 'something-else')
            ->expectsOutputToContain('password field confirmation does not match')
            ->assertFailed();

        $this->assertDatabaseMissing('users', ['username' => 'itadmin']);
    }

    public function test_it_refuses_a_username_that_is_already_taken(): void
    {
        User::factory()->create(['username' => 'itadmin', 'company_id' => Company::firstOrFail()->id]);

        $this->runCommand('itadmin', 'first-login-9', 'first-login-9')
            ->expectsOutputToContain('username has already been taken')
            ->assertFailed();

        $this->assertSame(1, User::where('username', 'itadmin')->count());
    }
}
