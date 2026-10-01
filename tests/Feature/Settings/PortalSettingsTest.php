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
            'headline' => "Let's Connect",
            'phone' => '(02) 8-123-4567',
            'email' => 'info@cbk.com.ph',
            'website' => 'www.cbk.com.ph',
            'location' => 'Makati City',
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('portal_settings', ['key' => 'contact.email', 'value' => 'info@cbk.com.ph']);
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
            'company_name' => 'CBK Hardware, Inc.',
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

        // "Super Admin" is rejected at the Form Request layer (Rule::in),
        // before the service ever runs — so this is a validation error,
        // not the service's DomainException.
        $this->actingAs($superAdmin)
            ->put(route('admin.roles-permissions.update'), ['role' => 'Super Admin', 'permissions' => []])
            ->assertSessionHasErrors('role');
    }
}