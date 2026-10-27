<?php

namespace Database\Factories;

use App\Models\PriceList;
use App\Models\PriceListDownload;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PriceListDownload>
 */
class PriceListDownloadFactory extends Factory
{
    public function definition(): array
    {
        return [
            'price_list_id' => PriceList::factory(),
            'user_id' => User::factory(),
            'user_name' => fake()->name(),
            'username' => fake()->userName(),
            'ip_address' => fake()->ipv4(),
        ];
    }
}
