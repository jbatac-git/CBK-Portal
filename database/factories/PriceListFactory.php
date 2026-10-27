<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PriceListFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(2),
            'file_disk' => 'local',
            'file_path' => 'price-lists/'.fake()->uuid().'.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
            'effective_date' => now(),
            'status' => 'active',
        ];
    }
}
