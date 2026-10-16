<?php

namespace App\Console\Commands;

use App\Mail\TestMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Sends one email right away (not queued) so mail settings can be checked
 * from the command line, with the mail server's own error when it fails.
 */
class SendTestMail extends Command
{
    protected $signature = 'mail:test {to : Address that should receive the test email}';

    protected $description = 'Send a test email to check the mail server settings';

    public function handle(): int
    {
        $to = (string) $this->argument('to');

        if (! filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $this->error("\"{$to}\" is not a valid email address.");

            return self::FAILURE;
        }

        $mailer = config('mail.default');
        $from = config('mail.from.address');

        $this->line("Mailer: {$mailer}  Host: ".config('mail.mailers.smtp.host').':'.config('mail.mailers.smtp.port'));
        $this->line('From:   '.($from ?: '(not set)'));

        if ($mailer === 'smtp' && (! config('mail.mailers.smtp.username') || ! $from)) {
            $this->error('Set MAIL_USERNAME, MAIL_PASSWORD and MAIL_FROM_ADDRESS in .env, then run: php artisan config:clear');

            return self::FAILURE;
        }

        try {
            Mail::to($to)->send(new TestMail);
        } catch (Throwable $e) {
            $this->error('Sending failed: '.$e->getMessage());
            $this->newLine();
            $this->line('Common Microsoft 365 causes:');
            $this->line(' - 535 5.7.139 / "SmtpClientAuthentication is disabled": IT must enable Authenticated SMTP for this mailbox.');
            $this->line(' - 535 5.7.3 "Authentication unsuccessful": wrong password, or the account uses MFA (use an app password).');
            $this->line(' - 554 5.2.252 "SendAsDenied": MAIL_FROM_ADDRESS must be the same mailbox as MAIL_USERNAME.');

            return self::FAILURE;
        }

        if ($mailer === 'log') {
            $this->warn('MAIL_MAILER is "log": the email was written to storage/logs/laravel.log, not sent.');

            return self::SUCCESS;
        }

        $this->info("Sent. Check the inbox (and spam folder) of {$to}.");

        return self::SUCCESS;
    }
}
