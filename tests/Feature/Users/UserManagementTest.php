<?php

namespace Tests\Feature\Users;

use App\Enums\AccountStatus;
use App\Enums\PortalModule;
use App\Enums\RoleName;
use App\Mail\TemporaryAccessMail;
use App\Models\Company;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);
        $this->company = Company::factory()->create();
    }

    private function userWithRole(RoleName $role, array $attributes = []): User
    {
        $user = User::factory()->create(['company_id' => $this->company->id, ...$attributes]);
        $user->assignRole($role->value);

        return $user;
    }

    private function payload(array $overrides = []): array
    {
        return [
            'first_name' => 'Jhonel',
            'middle_name' => 'Ganal',
            'last_name' => 'Batac',
            'employee_id' => '100001',
            'email' => 'jhonel@example.com',
            'company_id' => $this->company->id,
            'role' => RoleName::Diser->value,
            'modules' => [PortalModule::Learning->value],
            ...$overrides,
        ];
    }

    public function test_admin_can_create_a_temporary_employee_account(): void
    {
        Mail::fake();
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)
            ->post(route('admin.users.store'), $this->payload())
            ->assertRedirect(route('admin.users.index'));

        $user = User::where('username', 'jbatac01')->firstOrFail();

        $this->assertSame(AccountStatus::Temporary, $user->status);
        $this->assertTrue($user->hasRole(RoleName::Diser->value));
        $this->assertTrue($user->hasDirectPermission('portal.learning'));
        $this->assertFalse($user->hasDirectPermission('portal.price-lists'));
        $this->assertTrue($user->temporary_access_expires_at->between(now()->addDays(6), now()->addDays(7)->addMinute()));

        Mail::assertQueued(TemporaryAccessMail::class, fn ($mail) => $mail->hasTo('jhonel@example.com'));
    }

    public function test_the_emailed_password_is_the_one_stored_hashed(): void
    {
        Mail::fake();
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)->post(route('admin.users.store'), $this->payload());

        $user = User::where('username', 'jbatac01')->firstOrFail();

        Mail::assertQueued(TemporaryAccessMail::class, fn ($mail) =>
            $mail->temporaryPassword !== $user->password
            && Hash::check($mail->temporaryPassword, $user->password));
    }

    public function test_hr_gets_default_modules_even_if_they_send_others(): void
    {
        Mail::fake();
        $hr = $this->userWithRole(RoleName::Hr);

        $this->actingAs($hr)
            ->post(route('admin.users.store'), $this->payload(['modules' => [PortalModule::Learning->value]]))
            ->assertRedirect(route('admin.users.index'));

        $user = User::where('username', 'jbatac01')->firstOrFail();

        foreach (PortalModule::values() as $module) {
            $this->assertTrue($user->hasDirectPermission($module));
        }
    }

    public function test_hr_cannot_create_an_admin(): void
    {
        Mail::fake();
        $hr = $this->userWithRole(RoleName::Hr);

        $this->actingAs($hr)
            ->post(route('admin.users.store'), $this->payload(['role' => RoleName::Admin->value]))
            ->assertSessionHasErrors('role');

        $this->assertDatabaseMissing('users', ['email' => 'jhonel@example.com']);
    }

    public function test_admin_cannot_create_a_super_admin(): void
    {
        Mail::fake();
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)
            ->post(route('admin.users.store'), $this->payload(['role' => RoleName::SuperAdmin->value]))
            ->assertSessionHasErrors('role');
    }

    public function test_non_diser_roles_require_a_department(): void
    {
        Mail::fake();
        $superAdmin = $this->userWithRole(RoleName::SuperAdmin);

        $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), $this->payload(['role' => RoleName::Hr->value]))
            ->assertSessionHasErrors('department_id');
    }

    public function test_hr_cannot_open_or_update_an_admin_account(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($hr)->get(route('admin.users.edit', $admin))->assertForbidden();

        $this->actingAs($hr)
            ->put(route('admin.users.update', $admin), [
                'first_name' => 'Hacked',
                'last_name' => 'Admin',
                'email' => 'hacked@example.com',
                'company_id' => $this->company->id,
                'department_id' => null,
            ])
            ->assertForbidden();
    }

    public function test_admin_can_update_an_employee_and_their_modules(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->userWithRole(RoleName::Diser);
        $diser->syncPermissions(PortalModule::values());

        $this->actingAs($admin)
            ->put(route('admin.users.update', $diser), [
                'first_name' => 'Updated',
                'last_name' => 'Name',
                'email' => 'updated@example.com',
                'company_id' => $this->company->id,
                'department_id' => null,
                'modules' => [PortalModule::Learning->value],
            ])
            ->assertRedirect(route('admin.users.index'));

        $diser->refresh();

        $this->assertSame('updated@example.com', $diser->email);
        $this->assertTrue($diser->hasDirectPermission('portal.learning'));
        $this->assertFalse($diser->hasDirectPermission('portal.price-lists'));
    }

    public function test_a_diser_cannot_open_user_management(): void
    {
        $diser = $this->userWithRole(RoleName::Diser);

        $this->actingAs($diser)->get(route('admin.users.index'))->assertForbidden();
    }

    public function test_search_filters_the_list(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $this->userWithRole(RoleName::Diser, ['first_name' => 'Zed', 'last_name' => 'Quill']);
        $this->userWithRole(RoleName::Diser, ['first_name' => 'Amy', 'last_name' => 'Roe']);

        $this->actingAs($admin)
            ->get(route('admin.users.index', ['search' => 'quill']))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Users/Index')
                ->has('users.data', 1));
    }
}