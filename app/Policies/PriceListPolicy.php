<?php

namespace App\Policies;

use App\Models\PriceList;
use App\Models\User;

class PriceListPolicy
{
    public function viewAny(User $user): bool { return $user->can('price-lists.view'); }
    public function create(User $user): bool { return $user->can('price-lists.create'); }
    public function update(User $user, PriceList $priceList): bool { return $user->can('price-lists.update'); }
    public function archive(User $user, PriceList $priceList): bool { return $user->can('price-lists.archive'); }
}