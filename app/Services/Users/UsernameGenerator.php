<?php

namespace App\Services\Users;

use App\Models\User;
use Illuminate\Support\Str;

class UsernameGenerator
{
    /**
     * Official rule: first letter of first name + last name
     * + last 2 digits of the Employee ID.
     * Example: Jhonel Batac, ID 100001 => jbatac01
     */
    public function generate(string $firstName, string $lastName, string $employeeId): string
    {
        $base = Str::substr($this->clean($firstName), 0, 1).$this->clean($lastName);
        $digits = preg_replace('/\D+/', '', $employeeId);

        // Try the last 2 digits first (the official rule).
        // If taken, widen to 3, 4, ... digits of the Employee ID.
        for ($length = 2; $length <= max(2, strlen($digits)); $length++) {
            $suffix = str_pad(substr($digits, -$length), $length, '0', STR_PAD_LEFT);

            if (! $this->isTaken($base.$suffix)) {
                return $base.$suffix;
            }
        }

        // Extremely rare: even the full ID collides. Add a counter.
        $counter = 2;
        while ($this->isTaken($base.$digits.$counter)) {
            $counter++;
        }

        return $base.$digits.$counter;
    }

    /** "María De La Cruz" => "mariadelacruz": ASCII, lowercase, letters and digits only. */
    private function clean(string $value): string
    {
        return Str::lower(preg_replace('/[^a-z0-9]/i', '', Str::ascii($value)));
    }

    /**
     * withTrashed(): the database UNIQUE index still counts soft-deleted rows,
     * so a deleted user's username can NOT be reused.
     */
    private function isTaken(string $username): bool
    {
        return User::withTrashed()->where('username', $username)->exists();
    }
}