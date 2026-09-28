<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * ShouldQueue     => sent by the queue worker, so creating an account never
 *                    waits on the mail server.
 * ShouldBeEncrypted => the queued payload (which contains the plain temporary
 *                    password) is encrypted in the `jobs` table.
 */
class TemporaryAccessMail extends Mailable implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $temporaryPassword,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your Temporary CBK Portal Access');
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.temporary-access',
            with: ['days' => config('portal.temporary_access_days')],
        );
    }
}