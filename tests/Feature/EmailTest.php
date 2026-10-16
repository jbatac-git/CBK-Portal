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
