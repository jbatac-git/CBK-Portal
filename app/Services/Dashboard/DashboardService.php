<?php

namespace App\Services\Dashboard;

use App\Enums\AccountStatus;
use App\Models\LearningMaterial;
use App\Models\PriceList;
use App\Models\RemovalRequest;
use App\Models\User;

class DashboardService
{
    /**
     * Each stat only appears if the actor holds the matching permission —
     * this is what makes HR's dashboard genuinely different from Admin's,
     * without a single `if ($user->hasRole(...))` branch anywhere here.
     */
    public function statsFor(User $actor): array
    {
        $stats = [];

        if ($actor->can('users.view')) {
            $stats['active_users'] = User::where('status', AccountStatus::Active->value)->count();
            $stats['pending_approval'] = User::where('status', AccountStatus::Temporary->value)->count();

            // "Expiring soon" = temporary accounts whose 7-day window ends
            // within the next 2 days — an early warning so HR/Admin don't
            // get surprised by a sudden wave of auto-restrictions.
            $stats['expiring_soon'] = User::where('status', AccountStatus::Temporary->value)
                ->whereNotNull('temporary_access_expires_at')
                ->whereBetween('temporary_access_expires_at', [now(), now()->addDays(2)])
                ->count();
        }

        if ($actor->can('users.deactivate')) {
            $stats['pending_removals'] = RemovalRequest::pending()->count();
        }

        if ($actor->can('learning-materials.view')) {
            $stats['published_materials'] = LearningMaterial::published()->count();
        }

        if ($actor->can('price-lists.view')) {
            $stats['active_price_lists'] = PriceList::active()->count();
        }

        return $stats;
    }
}