<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Laravel's password reset email, sent in the CBK Academy design instead
 * of the framework's generic template. The token and link are unchanged.
 */
class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $broker = config('auth.defaults.passwords');

        return (new MailMessage)
            ->subject('Reset your CBK Academy password')
            ->view('mail.reset-password', [
                'user' => $notifiable,
                'url' => $this->resetUrl($notifiable),
                'expires' => config("auth.passwords.{$broker}.expire"),
            ]);
    }
}
