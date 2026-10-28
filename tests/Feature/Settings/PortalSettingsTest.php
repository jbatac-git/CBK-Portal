<?php

namespace Tests\Feature\Settings;

use App\Enums\RoleName;
use App\Models\Company;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PortalSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);
        Storage::fake('public');
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['company_id' => Company::factory()]);
        $user->assignRole($role->value);

        return $user;
    }

    public function test_admin_can_update_contact_us(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)->put(route('admin.contact-us.update'), [
            'contact' => [
                'headline' => "Let's Connect",
                'phone' => '(02) 8-123-4567',
                'email' => 'info@cbk.com.ph',
                'website' => 'www.cbk.com.ph',
                'location' => 'Makati City',
            ],
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('portal_settings', ['key' => 'contact.email', 'value' => 'info@cbk.com.ph']);
    }

    public function test_a_deleted_company_name_can_be_added_again(): void
    {
        $superAdmin = $this->userWithRole(RoleName::SuperAdmin);
        $company = Company::factory()->create(['name' => 'ACME Trading']);

        $this->actingAs($superAdmin)->delete(route('admin.companies.destroy', $company));

        $this->actingAs($superAdmin)
            ->post(route('admin.companies.store'), ['name' => 'ACME Trading', 'is_active' => true])
            ->assertSessionHasNoErrors();

        $this->assertSame(1, Company::where('name', 'ACME Trading')->count());
    }

    public function test_maintenance_entries_are_saved_from_the_side_panel_back_to_their_list(): void
    {
        $superAdmin = $this->userWithRole(RoleName::SuperAdmin);
        $company = Company::factory()->create(['name' => 'Old Name']);
        $list = route('admin.maintenance.index', ['tab' => 'companies', 'search' => 'old']);

        $this->actingAs($superAdmin)
            ->from($list)
            ->put(route('admin.companies.update', $company), ['name' => 'New Name', 'is_active' => true])
            ->assertRedirect($list);

        $this->assertSame('New Name', $company->fresh()->name);
    }

    public function test_a_maintenance_save_without_a_previous_page_lands_on_its_tab(): void
    {
        $superAdmin = $this->userWithRole(RoleName::SuperAdmin);

        $this->actingAs($superAdmin)
            ->post(route('admin.departments.store'), ['name' => 'Logistics', 'is_active' => true])
            ->assertRedirect(route('admin.maintenance.index', ['tab' => 'departments']));
    }

    public function test_hr_cannot_update_contact_us(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);

        $this->actingAs($hr)->get(route('admin.contact-us.edit'))->assertForbidden();
    }

    public function test_only_super_admin_can_update_branding_and_roles(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $superAdmin = $this->userWithRole(RoleName::SuperAdmin);

        $this->actingAs($admin)->get(route('admin.settings.index'))->assertForbidden();
        $this->actingAs($admin)->get(route('admin.roles-permissions.index'))->assertForbidden();

        $this->actingAs($superAdmin)->put(route('admin.settings.update'), [
            'footer' => ['company_name' => 'CBK Hardware, Inc.'],
            'logo' => UploadedFile::fake()->image('logo.png'),
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('portal_settings', ['key' => 'footer.company_name']);
        $this->assertDatabaseHas('portal_settings', ['key' => 'branding.logo_path']);
    }

    public function test_super_admin_can_edit_hr_permissions_but_not_their_own_role(): void
    {
        $superAdmin = $this->userWithRole(RoleName::SuperAdmin);

        $this->actingAs($superAdmin)
            ->put(route('admin.roles-permissions.update'), [
                'role' => 'HR',
                'permissions' => ['users.view', 'users.create'],
            ])
            ->assertSessionHas('success');

        $hr = $this->userWithRole(RoleName::Hr);
        $this->assertTrue($hr->hasPermissionTo('users.create'));
        $this->assertFalse($hr->hasPermissionTo('users.approve'));

        $this->actingAs($superAdmin)
            ->put(route('admin.roles-permissions.update'), ['role' => 'Super Admin', 'permissions' => []])
            ->assertSessionHas('error');
    }
}
