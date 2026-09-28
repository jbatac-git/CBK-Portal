<?php

namespace Tests\Feature\Auth;

use App\Enums\AccountStatus;
use App\Enums\RoleName;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsernameLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // The Vite manifest is stale in tests; we only care about the backend here.
        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_user_can_log_in_with_username_case_insensitively(): void
    {
        $user = User::factory()->create(['username' => 'jbatac01']);
        $user->assignRole(RoleName::Diser->value);

        $response = $this->post(route('login'), [
            'username' => 'JBatac01',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_deactivated_user_cannot_log_in(): void
    {
        User::factory()->create([
            'username' => 'lgarcia07',
            'status' => AccountStatus::Deactivated,
        ]);

        $this->post(route('login'), ['username' => 'lgarcia07', 'password' => 'password'])
            ->assertSessionHasErrors('username');

        $this->assertGuest();
    }

    public function test_expired_temporary_account_cannot_log_in(): void
    {
        User::factory()->create([
            'username' => 'jbatac01',
            'status' => AccountStatus::Temporary,
            'temporary_access_expires_at' => now()->subDay(),
        ]);

        $this->post(route('login'), ['username' => 'jbatac01', 'password' => 'password'])
            ->assertSessionHasErrors('username');

        $this->assertGuest();
    }

    public function test_deactivating_a_logged_in_user_blocks_their_next_request(): void
    {
        $user = User::factory()->create();
        $user->assignRole(RoleName::Diser->value);

        $this->actingAs($user)->get(route('portal.home'))->assertOk();

        $user->update(['status' => AccountStatus::Deactivated]);

        $this->actingAs($user->fresh())
            ->get(route('portal.home'))
            ->assertRedirect(route('login'));
    }

    public function test_users_are_sent_to_their_own_portal_and_cannot_open_the_other(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(RoleName::Admin->value);

        $diser = User::factory()->create();
        $diser->assignRole(RoleName::Diser->value);

        $this->actingAs($admin)->get(route('dashboard'))->assertRedirect(route('admin.dashboard'));
        $this->actingAs($diser)->get(route('dashboard'))->assertRedirect(route('portal.home'));

        $this->actingAs($diser)->get(route('admin.dashboard'))->assertForbidden();
    }

    public function test_public_registration_is_disabled(): void
    {
        $this->get('/register')->assertNotFound();
    }
}