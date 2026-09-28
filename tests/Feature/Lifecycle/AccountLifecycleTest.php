<?php

namespace Tests\Feature\Lifecycle;

use App\Enums\AccountStatus;
use App\Enums\RemovalRequestStatus;
use App\Enums\RoleName;
use App\Mail\TemporaryAccessMail;
use App\Models\Company;
use App\Models\RemovalRequest;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AccountLifecycleTest extends TestCase
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

    private function temporaryDiser(array $attributes = []): User
    {
        return $this->userWithRole(RoleName::Diser, [
            'status' => AccountStatus::Temporary,
            'temporary_access_expires_at' => now()->addDays(5),
            'must_change_password' => true,
            ...$attributes,
        ]);
    }

    public function test_admin_can_approve_a_temporary_account(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->temporaryDiser();

        $this->actingAs($admin)
            ->post(route('admin.users.approve', $diser))
            ->assertSessionHas('success');

        $diser->refresh();

        $this->assertSame(AccountStatus::Active, $diser->status);
        $this->assertNull($diser->temporary_access_expires_at);
        $this->assertSame($admin->id, $diser->status_changed_by);
        $this->assertNotNull($diser->status_changed_at);
    }

    public function test_hr_can_approve_a_diser_but_not_another_hr(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);

        $diser = $this->temporaryDiser();
        $this->actingAs($hr)->post(route('admin.users.approve', $diser))->assertSessionHas('success');
        $this->assertSame(AccountStatus::Active, $diser->fresh()->status);

        $otherHr = $this->userWithRole(RoleName::Hr, ['status' => AccountStatus::Temporary]);
        $this->actingAs($hr)->post(route('admin.users.approve', $otherHr))->assertForbidden();
    }

    public function test_not_approving_restricts_the_account(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->temporaryDiser();

        $this->actingAs($admin)->post(route('admin.users.decline', $diser))->assertSessionHas('success');

        $diser->refresh();

        $this->assertSame(AccountStatus::Restricted, $diser->status);
        $this->assertFalse($diser->hasPortalAccess());
    }

    public function test_illegal_transitions_show_a_friendly_error_and_change_nothing(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->userWithRole(RoleName::Diser, ['status' => AccountStatus::Deactivated]);

        $this->actingAs($admin)
            ->post(route('admin.users.approve', $diser))
            ->assertSessionHas('error');

        $this->assertSame(AccountStatus::Deactivated, $diser->fresh()->status);
    }

    public function test_deactivation_revokes_sessions_and_the_remember_token(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->userWithRole(RoleName::Diser);
        $oldToken = $diser->remember_token;

        DB::table('sessions')->insert([
            'id' => 'session-of-diser',
            'user_id' => $diser->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'phpunit',
            'payload' => 'x',
            'last_activity' => now()->timestamp,
        ]);

        $this->actingAs($admin)->post(route('admin.users.deactivate', $diser))->assertSessionHas('success');

        $this->assertDatabaseMissing('sessions', ['user_id' => $diser->id]);
        $this->assertNotSame($oldToken, $diser->fresh()->remember_token);
        $this->assertSame(AccountStatus::Deactivated, $diser->fresh()->status);
    }

    public function test_hr_cannot_deactivate_and_nobody_can_deactivate_themselves(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);
        $superAdmin = $this->userWithRole(RoleName::SuperAdmin);
        $diser = $this->userWithRole(RoleName::Diser);

        $this->actingAs($hr)->post(route('admin.users.deactivate', $diser))->assertForbidden();
        $this->actingAs($superAdmin)->post(route('admin.users.deactivate', $superAdmin))->assertForbidden();
    }

    public function test_hr_removal_request_is_processed_by_an_admin(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->userWithRole(RoleName::Diser);

        $this->actingAs($hr)
            ->post(route('admin.users.removal-request', $diser), ['reason' => 'resigned', 'details' => 'Last day: Friday'])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('removal_requests', [
            'user_id' => $diser->id,
            'requested_by' => $hr->id,
            'status' => 'pending',
        ]);

        // A second pending request for the same employee is refused.
        $this->actingAs($hr)
            ->post(route('admin.users.removal-request', $diser), ['reason' => 'awol'])
            ->assertSessionHas('error');
        $this->assertSame(1, RemovalRequest::count());

        $request = RemovalRequest::firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.removal-requests.approve', $request))
            ->assertSessionHas('success');

        $this->assertSame(AccountStatus::Deactivated, $diser->fresh()->status);
        $this->assertSame(RemovalRequestStatus::Approved, $request->fresh()->status);
        $this->assertSame($admin->id, $request->fresh()->processed_by);
    }

    public function test_declined_removal_request_keeps_the_account_active(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->userWithRole(RoleName::Diser);

        $this->actingAs($hr)->post(route('admin.users.removal-request', $diser), ['reason' => 'separated']);
        $request = RemovalRequest::firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.removal-requests.decline', $request), ['decision_note' => 'Still employed'])
            ->assertSessionHas('success');

        $this->assertSame(AccountStatus::Active, $diser->fresh()->status);
        $this->assertSame(RemovalRequestStatus::Declined, $request->fresh()->status);
    }

    public function test_hr_cannot_process_removal_requests(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);
        $diser = $this->userWithRole(RoleName::Diser);

        $this->actingAs($hr)->post(route('admin.users.removal-request', $diser), ['reason' => 'resigned']);
        $request = RemovalRequest::firstOrFail();

        $this->actingAs($hr)->post(route('admin.removal-requests.approve', $request))->assertForbidden();
        $this->actingAs($hr)->get(route('admin.removal-requests.index'))->assertForbidden();
    }

    public function test_expire_command_restricts_only_overdue_temporary_accounts(): void
    {
        $overdue = $this->temporaryDiser(['temporary_access_expires_at' => now()->subHour()]);
        $stillValid = $this->temporaryDiser(['temporary_access_expires_at' => now()->addDay()]);
        $active = $this->userWithRole(RoleName::Diser);

        $this->artisan('accounts:expire-temporary')->assertSuccessful();

        $this->assertSame(AccountStatus::Restricted, $overdue->fresh()->status);
        $this->assertSame(AccountStatus::Temporary, $stillValid->fresh()->status);
        $this->assertSame(AccountStatus::Active, $active->fresh()->status);
    }

    public function test_resend_credentials_replaces_the_password(): void
    {
        Mail::fake();
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->temporaryDiser();

        $this->actingAs($admin)->post(route('admin.users.resend-credentials', $diser))->assertSessionHas('success');

        Mail::assertQueued(TemporaryAccessMail::class, fn ($mail) => $mail->hasTo($diser->email));
        $this->assertFalse(Hash::check('password', $diser->fresh()->password));
    }

    public function test_resend_is_refused_after_the_password_was_changed_or_the_period_ended(): void
    {
        Mail::fake();
        $admin = $this->userWithRole(RoleName::Admin);

        $changed = $this->temporaryDiser(['must_change_password' => false]);
        $this->actingAs($admin)->post(route('admin.users.resend-credentials', $changed))->assertSessionHas('error');

        $expired = $this->temporaryDiser(['temporary_access_expires_at' => now()->subDay()]);
        $this->actingAs($admin)->post(route('admin.users.resend-credentials', $expired))->assertSessionHas('error');

        Mail::assertNothingQueued();
    }

    public function test_forced_password_change_flow(): void
    {
        $user = $this->userWithRole(RoleName::Diser, ['must_change_password' => true]);

        // Everything redirects to the change-password page first.
        $this->actingAs($user)->get(route('portal.home'))->assertRedirect(route('password.change'));
        $this->actingAs($user)->get(route('password.change'))->assertOk();

        // Reusing the temporary password is refused.
        $this->actingAs($user)
            ->post(route('password.change.store'), [
                'current_password' => 'password',
                'password' => 'password',
                'password_confirmation' => 'password',
            ])
            ->assertSessionHasErrors('password');

        $this->actingAs($user)
            ->post(route('password.change.store'), [
                'current_password' => 'password',
                'password' => 'N3w-Secure-Pass!',
                'password_confirmation' => 'N3w-Secure-Pass!',
            ])
            ->assertRedirect(route('dashboard'));

        $user->refresh();

        $this->assertFalse($user->must_change_password);
        $this->assertTrue(Hash::check('N3w-Secure-Pass!', $user->password));
        $this->actingAs($user)->get(route('portal.home'))->assertOk();
    }

    public function test_temporary_diser_is_limited_to_the_allowed_routes(): void
    {
        // Probe routes: the real learning / price-list pages arrive in later phases.
        Route::middleware(['web', 'auth', 'active', 'temporary.scope'])->group(function () {
            Route::get('/_probe/learning', fn () => 'ok')->name('portal.learning.probe');
            Route::get('/_probe/price-lists', fn () => 'ok')->name('portal.price-lists.probe');
        });

        $temporary = $this->temporaryDiser(['must_change_password' => false]);
        $active = $this->userWithRole(RoleName::Diser);

        $this->actingAs($temporary)->get('/_probe/learning')->assertOk();
        $this->actingAs($temporary)->get('/_probe/price-lists')->assertForbidden();
        $this->actingAs($active)->get('/_probe/price-lists')->assertOk();
    }
}