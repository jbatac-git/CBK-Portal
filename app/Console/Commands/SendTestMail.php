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

        if ($mailer === 'smtp' && (! config('mail.mailers.smtp.username') || ! config('mail.mailers.smtp.password') || ! $from)) {
            $this->error('Set MAIL_USERNAME, MAIL_PASSWORD and MAIL_FROM_ADDRESS in .env, then run: php artisan config:clear');

            return self::FAILURE;
        }

        try {
            Mail::to($to)->send(new TestMail);
        } catch (Throwable $e) {
            $this->error('Sending failed: '.$e->getMessage());
            $this->newLine();

            foreach ($this->troubleshootingTips((string) config('mail.mailers.smtp.host')) as $tip) {
                $this->line($tip);
            }

            return self::FAILURE;
        }

        if ($mailer === 'log') {
            $this->warn('MAIL_MAILER is "log": the email was written to storage/logs/laravel.log, not sent.');

            return self::SUCCESS;
        }

        $this->info("Sent. Check the inbox (and spam folder) of {$to}.");

        return self::SUCCESS;
    }

    /**
     * Likely causes of a failed send, for the mail provider in MAIL_HOST.
     *
     * @return array<int, string>
     */
    private function troubleshootingTips(string $host): array
    {
        if (str_contains($host, 'gmail.com')) {
            return [
                'Common Gmail causes:',
                ' - 535 5.7.8 "Username and Password not accepted": MAIL_PASSWORD must be a Google App Password (16 letters, no spaces), not the Gmail login password.',
                ' - "Application-specific password required": turn on 2-Step Verification, then create an App Password at https://myaccount.google.com/apppasswords.',
                ' - MAIL_FROM_ADDRESS must be the same Gmail address as MAIL_USERNAME.',
            ];
        }

        return [
            'Common Microsoft 365 causes:',
            ' - 535 5.7.139 / "SmtpClientAuthentication is disabled": IT must enable Authenticated SMTP for this mailbox.',
            ' - 535 5.7.3 "Authentication unsuccessful": wrong password, or the account uses MFA (use an app password).',
            ' - 554 5.2.252 "SendAsDenied": MAIL_FROM_ADDRESS must be the same mailbox as MAIL_USERNAME.',
        ];
    }
}
