<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\SentMessage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Throwable;

/**
 * Temporary credentials for a new (or re-sent) account.
 *
 * ShouldBeEncrypted => the queued payload (which contains the plain temporary
 * password) is encrypted at rest in the jobs table.
 *
 * Delivery is recorded on the user (credentials_email_*), so HR and Admin can
 * see in User management whether the employee actually received it.
 */
class TemporaryAccessMail extends Mailable implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable, SerializesModels;

    public const STATUS_QUEUED = 'queued';

    public const STATUS_SENT = 'sent';

    public const STATUS_FAILED = 'failed';

    /** A brief mail server hiccup should not fail the email outright. */
    public int $tries = 3;

    /** @var array<int, int> seconds to wait before the 2nd and 3rd attempt */
    public array $backoff = [30, 120];

    public function __construct(
        public User $user,
        public string $temporaryPassword,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your CBK Academy account');
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.temporary-access',
            with: ['days' => config('portal.temporary_access_days')],
        );
    }

    /** Marks the user's credentials email as waiting in the queue. */
    public static function markQueued(User $user): void
    {
        $user->forceFill([
            'credentials_email_status' => self::STATUS_QUEUED,
            'credentials_email_sent_at' => null,
            'credentials_email_error' => null,
        ])->saveQuietly();
    }

    public function send($mailer): ?SentMessage
    {
        try {
            $sent = parent::send($mailer);
        } catch (Throwable $e) {
            // Keep the latest reason visible while the queue retries.
            $this->user->forceFill(['credentials_email_error' => $this->reason($e)])->saveQuietly();

            throw $e;
        }

        $this->user->forceFill([
            'credentials_email_status' => self::STATUS_SENT,
            'credentials_email_sent_at' => now(),
            'credentials_email_error' => null,
        ])->saveQuietly();

        return $sent;
    }

    /** Called by the queue once every attempt has failed. */
    public function failed(Throwable $e): void
    {
        $this->user->forceFill([
            'credentials_email_status' => self::STATUS_FAILED,
            'credentials_email_error' => $this->reason($e),
        ])->saveQuietly();
    }

    private function reason(Throwable $e): string
    {
        return Str::limit(trim($e->getMessage()), 480);
    }
}
