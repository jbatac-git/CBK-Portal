<?php

namespace Tests\Feature;

use App\Enums\RoleName;
use App\Models\Company;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
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

    public function test_diser_sees_the_portal_profile_page(): void
    {
        $diser = $this->userWithRole(RoleName::Diser);

        $this->actingAs($diser)
            ->get(route('profile.edit'))
            ->assertInertia(fn ($page) => $page->component('Portal/Profile/Edit'));
    }

    public function test_admin_sees_the_admin_profile_page(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)
            ->get(route('profile.edit'))
            ->assertInertia(fn ($page) => $page->component('Admin/Profile/Edit'));
    }

    public function test_user_can_update_contact_number_and_photo(): void
    {
        $user = $this->userWithRole(RoleName::Diser);

        $this->actingAs($user)
            ->put(route('profile.contact.update'), ['contact_number' => '0917-123-4567'])
            ->assertSessionHas('success');

        $this->assertSame('0917-123-4567', $user->fresh()->contact_number);

        $this->actingAs($user)
            ->post(route('profile.photo.update'), ['photo' => UploadedFile::fake()->image('me.jpg', 800, 800)])
            ->assertSessionHas('success');

        Storage::disk('public')->assertExists($user->fresh()->profile_photo_path);
    }

    public function test_user_can_change_their_own_password_with_correct_current_password(): void
    {
        $user = $this->userWithRole(RoleName::Diser);

        $this->actingAs($user)
            ->put(route('profile.password.update'), [
                'current_password' => 'wrong-password',
                'password' => 'Brand-N3w-Pass!',
                'password_confirmation' => 'Brand-N3w-Pass!',
            ])
            ->assertSessionHasErrors('current_password');

        $this->actingAs($user)
            ->put(route('profile.password.update'), [
                'current_password' => 'password',
                'password' => 'Brand-N3w-Pass!',
                'password_confirmation' => 'Brand-N3w-Pass!',
            ])
            ->assertSessionHas('success');

        $this->assertTrue(Hash::check('Brand-N3w-Pass!', $user->fresh()->password));
    }

    public function test_temporary_diser_cannot_open_their_profile(): void
    {
        $temporary = User::factory()->create([
            'company_id' => Company::factory(),
            'status' => 'temporary',
            'temporary_access_expires_at' => now()->addDays(5),
            'must_change_password' => false,
        ]);
        $temporary->assignRole(RoleName::Diser->value);

        $this->actingAs($temporary)->get(route('profile.edit'))->assertForbidden();
    }
}