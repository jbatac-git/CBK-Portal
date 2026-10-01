<?php

namespace Database\Factories;

use App\Models\LearningMaterialCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class LearningMaterialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'learning_material_category_id' => LearningMaterialCategory::factory(),
            'title' => fake()->sentence(3),
            'type' => 'pdf',
            'file_disk' => 'local',
            'file_path' => 'learning-materials/pdf/'.fake()->uuid().'.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
            'status' => 'draft',
            'available_during_temporary' => false,
            'sort_order' => 0,
        ];
    }
}