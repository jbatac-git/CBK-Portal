<?php

namespace App\Enums;

use App\Models\User;

enum RoleName: string
{
    case SuperAdmin = 'Super Admin';
    case Admin = 'Admin';
    case Hr = 'HR';
    case Diser = 'Diser';

    /**
     * Higher number = more powerful.
     * This is the ONE place that defines who outranks whom.
     */
    public function rank(): int
    {
        return match ($this) {
            self::SuperAdmin => 4,
            self::Admin => 3,
            self::Hr => 2,
            self::Diser => 1,
        };
    }

    /** The highest rank among the roles a user holds (0 = no known role). */
    public static function rankOf(User $user): int
    {
        return $user->getRoleNames()
            ->map(fn (string $name) => self::tryFrom($name)?->rank() ?? 0)
            ->max() ?? 0;
    }

    /**
     * Roles this actor may hand out: Super Admin can assign anything,
     * everyone else only roles ranked BELOW their own.
     *
     * @return array<int, self>
     */
    public static function assignableBy(User $actor): array
    {
        if ($actor->hasRole(self::SuperAdmin->value)) {
            return self::cases();
        }

        $actorRank = self::rankOf($actor);

        return array_values(array_filter(
            self::cases(),
            fn (self $role) => $role->rank() < $actorRank,
        ));
    }
}