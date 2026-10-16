<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Sent by `php artisan mail:test` to confirm the mail server settings work. */
class TestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'CBK Academy email test');
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.test',
            with: [
                'host' => config('mail.mailers.smtp.host'),
                'sentAt' => now()->format('F j, Y g:i A'),
            ],
        );
    }
}
