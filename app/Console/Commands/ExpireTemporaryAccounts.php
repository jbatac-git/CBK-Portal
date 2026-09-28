<?php

namespace App\Console\Commands;

use App\Services\Users\AccountLifecycleService;
use Illuminate\Console\Command;

class ExpireTemporaryAccounts extends Command
{
    protected $signature = 'accounts:expire-temporary';

    protected $description = 'Restrict temporary accounts whose access period has ended';

    public function handle(AccountLifecycleService $lifecycle): int
    {
        $count = $lifecycle->expireOverdue();

        $this->info("Restricted {$count} expired temporary account(s).");

        return self::SUCCESS;
    }
}