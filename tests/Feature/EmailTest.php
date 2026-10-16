<?php

namespace Tests\Feature;

use App\Enums\AccountStatus;
use App\Enums\RoleName;
use App\Mail\TemporaryAccessMail;
use App\Mail\TestMail;
use App\Models\Company;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EmailTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function diser(array $attributes = []): User
    {
        $user = User::factory()->create(['company_id' => Company::factory(), ...$attributes]);
        $user->assignRole(RoleName::Diser->value);

        return $user;
    }

    public function test_temporary_access_email_shows_the_credentials_in_the_academy_design(): void
    {
        $user = $this->diser([
            'status' => AccountStatus::Temporary,
            'temporary_access_expires_at' => now()->addDays(7),
        ]);

        $html = (new TemporaryAccessMail($user, 'Tmp-Pass-123'))->render();

        $this->assertStringContainsString($user->username, $html);
        $this->assertStringContainsString('Tmp-Pass-123', $html);
        $this->assertStringContainsString('Academy', $html);
        $this->assertStringContainsString(route('login'), $html);
    }

    public function test_forgot_password_sends_the_branded_reset_email(): void
    {
        Notification::fake();
        $user = $this->diser();

        $this->post(route('password.email'), ['email' => $user->email])->assertSessionHasNoErrors();

        Notification::assertSentTo($user, ResetPasswordNotification::class, function (ResetPasswordNotification $notification) use ($user) {
            $html = (string) $notification->toMail($user)->render();

            return str_contains($html, 'Reset your password')
                && str_contains($html, $user->username)
                && str_contains($html, route('password.reset', $notification->token, false));
        });
    }

    public function test_creating_an_employee_records_that_the_credentials_email_was_sent(): void
    {
        $admin = User::factory()->create(['company_id' => Company::factory()]);
        $admin->assignRole(RoleName::Admin->value);

        $this->actingAs($admin)->post(route('admin.users.store'), [
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'employee_id' => '200501',
            'email' => 'maria.santos@example.com',
            'company_id' => $admin->company_id,
            'role' => RoleName::Diser->value,
        ])->assertSessionHasNoErrors();

        $employee = User::where('email', 'maria.santos@example.com')->firstOrFail();
        $this->assertSame(TemporaryAccessMail::STATUS_SENT, $employee->credentials_email_status);
        $this->assertNotNull($employee->credentials_email_sent_at);

        $this->actingAs($admin)
            ->get(route('admin.users.index'))
            ->assertInertia(fn ($page) => $page->where(
                'users.data',
                fn ($rows) => collect($rows)->firstWhere('email', 'maria.santos@example.com')['credentials_email']['status'] === 'sent',
            ));
    }

    public function test_a_credentials_email_that_keeps_failing_is_marked_failed_with_the_reason(): void
    {
        $user = $this->diser(['status' => AccountStatus::Temporary, 'temporary_access_expires_at' => now()->addDays(7)]);
        TemporaryAccessMail::markQueued($user);

        (new TemporaryAccessMail($user, 'Tmp-Pass-123'))->failed(new \RuntimeException('535 5.7.3 Authentication unsuccessful'));

        $user->refresh();
        $this->assertSame(TemporaryAccessMail::STATUS_FAILED, $user->credentials_email_status);
        $this->assertStringContainsString('535 5.7.3', $user->credentials_email_error);
    }

    public function test_mail_test_command_refuses_to_run_without_smtp_credentials(): void
    {
        config(['mail.default' => 'smtp', 'mail.mailers.smtp.username' => null]);

        $this->artisan('mail:test', ['to' => 'it@example.com'])->assertFailed();
    }

    public function test_mail_test_command_sends_the_test_email(): void
    {
        Mail::fake();
        config(['mail.default' => 'array']);

        $this->artisan('mail:test', ['to' => 'it@example.com'])->assertSuccessful();

        Mail::assertSent(TestMail::class, fn (TestMail $mail) => $mail->hasTo('it@example.com'));
    }
}
