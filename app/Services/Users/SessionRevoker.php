<?php

namespace App\Services\Users;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Signs a user out of EVERY device, right now.
 * Requires SESSION_DRIVER=database (the Laravel 12 default).
 */
class SessionRevoker
{
    public function revoke(User $user): void
    {
        // 1) Delete every active session row of this user.
        DB::table(config('session.table', 'sessions'))
            ->where('user_id', $user->id)
            ->delete();

        // 2) Rotate the remember token, otherwise an old "Remember me"
        //    cookie could log the user straight back in.
        $user->forceFill(['remember_token' => Str::random(60)])->save();
    }

    /**
     * Signs the user out everywhere EXCEPT the given session. Used after a
     * password change, so anyone who logged in with the old password
     * (e.g. an intercepted temporary password) loses access at once.
     */
    public function revokeOthers(User $user, string $keepSessionId): void
    {
        DB::table(config('session.table', 'sessions'))
            ->where('user_id', $user->id)
            ->where('id', '!=', $keepSessionId)
            ->delete();

        $user->forceFill(['remember_token' => Str::random(60)])->save();
    }
}
