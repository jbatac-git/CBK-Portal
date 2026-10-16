<?php

namespace Tests\Feature\Lifecycle;

use App\Enums\AccountStatus;
use App\Enums\RemovalRequestStatus;
use App\Enums\RoleName;
use App\Mail\TemporaryAccessMail;
use App\Models\Company;
use App\Models\RemovalReason;
use App\Models\RemovalRequest;
use App\Models\User;
use App\Services\Users\AccountLifecycleService;
use App\Services\Users\RemovalRequestService;
use Database\Seeders\RolePermissionSeeder;
use DomainException;
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

        $resigned = RemovalReason::where('slug', 'resigned')->value('id');
        $awol = RemovalReason::where('slug', 'awol')->value('id');

        $this->actingAs($hr)
            ->post(route('admin.users.removal-request', $diser), [
                'removal_reason_id' => $resigned,
                'details' => 'Last day: Friday',
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('removal_requests', [
            'user_id' => $diser->id,
            'requested_by' => $hr->id,
            'status' => 'pending',
        ]);

        // A second pending request for the same employee is refused.
        $this->actingAs($hr)
            ->post(route('admin.users.removal-request', $diser), ['removal_reason_id' => $awol])
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

        $separated = RemovalReason::where('slug', 'separated')->value('id');

        $this->actingAs($hr)->post(route('admin.users.removal-request', $diser), [
            'removal_reason_id' => $separated,
        ]);
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

        $resigned = RemovalReason::where('slug', 'resigned')->value('id');

        $this->actingAs($hr)->post(route('admin.users.removal-request', $diser), [
            'removal_reason_id' => $resigned,
        ]);
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

    public function test_removal_requests_page_shows_the_reason_name(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->userWithRole(RoleName::Diser);

        $resigned = RemovalReason::where('slug', 'resigned')->value('id');

        $this->actingAs($hr)->post(route('admin.users.removal-request', $diser), [
            'removal_reason_id' => $resigned,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.removal-requests.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/RemovalRequests/Index')
                ->where('requests.0.reason', 'Resigned'));
    }

    public function test_a_stale_approve_cannot_reactivate_a_deactivated_account(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->temporaryDiser();
        $staleCopy = User::findOrFail($diser->id);

        $lifecycle = app(AccountLifecycleService::class);
        $lifecycle->deactivate($diser, $admin);

        try {
            $lifecycle->approve($staleCopy, $admin);
            $this->fail('Approving a deactivated account should be refused.');
        } catch (DomainException) {
            // expected
        }

        $this->assertSame(AccountStatus::Deactivated, $diser->fresh()->status);
    }

    public function test_an_approved_removal_request_cannot_be_declined_by_a_stale_copy(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->userWithRole(RoleName::Diser);

        $this->actingAs($hr)->post(route('admin.users.removal-request', $diser), [
            'removal_reason_id' => RemovalReason::where('slug', 'resigned')->value('id'),
        ]);
        $staleCopy = RemovalRequest::firstOrFail();

        $this->actingAs($admin)->post(route('admin.removal-requests.approve', $staleCopy));

        try {
            app(RemovalRequestService::class)->decline($staleCopy, $admin, 'Too late');
            $this->fail('Declining an already approved request should be refused.');
        } catch (DomainException) {
            // expected
        }

        $this->assertSame(RemovalRequestStatus::Approved, $staleCopy->fresh()->status);
        $this->assertSame(AccountStatus::Deactivated, $diser->fresh()->status);
    }

    public function test_temporary_diser_cannot_open_real_portal_routes_outside_the_allowed_list(): void
    {
        $temporary = $this->temporaryDiser(['must_change_password' => false]);
        $temporary->syncPermissions(['portal.learning', 'portal.price-lists', 'portal.contact-us']);

        $this->actingAs($temporary)->get(route('portal.home'))->assertOk();
        $this->actingAs($temporary)->get(route('portal.price-lists.index'))->assertForbidden();
        $this->actingAs($temporary)->get(route('portal.contact.index'))->assertForbidden();
    }

    public function test_changing_the_temporary_password_signs_out_other_sessions(): void
    {
        $user = $this->temporaryDiser(['password' => 'password']);

        DB::table('sessions')->insert([
            'id' => 'other-device-session',
            'user_id' => $user->id,
            'payload' => '',
            'last_activity' => now()->timestamp,
        ]);

        $this->actingAs($user)->post(route('password.change.store'), [
            'current_password' => 'password',
            'password' => 'N3w-Secure-Pass!',
            'password_confirmation' => 'N3w-Secure-Pass!',
        ]);

        $this->assertDatabaseMissing('sessions', ['id' => 'other-device-session']);
    }

    public function test_removal_request_with_a_deleted_reason_is_rejected(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);
        $diser = $this->userWithRole(RoleName::Diser);

        $reason = RemovalReason::where('slug', 'awol')->firstOrFail();
        $reason->delete();

        $this->actingAs($hr)
            ->post(route('admin.users.removal-request', $diser), ['removal_reason_id' => $reason->id])
            ->assertSessionHasErrors('removal_reason_id');
    }

    public function test_portal_requires_the_forced_password_change_first(): void
    {
        $diser = $this->userWithRole(RoleName::Diser, ['must_change_password' => true]);

        $this->actingAs($diser)->get(route('portal.home'))->assertRedirect(route('password.change'));
    }
}
