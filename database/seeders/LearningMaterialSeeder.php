<?php

namespace Database\Seeders;

use App\Models\LearningMaterial;
use App\Models\LearningMaterialCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class LearningMaterialSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local')) {
            return;
        }

        $category = LearningMaterialCategory::firstOrCreate(['name' => 'Core Learning Resources']);
        $admin = User::whereHas('roles', fn ($q) => $q->where('name', 'Super Admin'))->first();

        $titles = [
            'Company Overview', 'All About Sales Merchandiser', 'Product Knowledge',
            'Trade Marketing and Display', 'Store Consignment Office SOP',
            'Auto Replenishment SOP', 'Operational Process',
        ];

        foreach ($titles as $i => $title) {
            $path = "learning-materials/pdf/seed-{$i}.pdf";

            // A minimal, valid, empty PDF so finfo detects it correctly in demos.
            Storage::disk('local')->put($path, "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>");

            LearningMaterial::firstOrCreate(
                ['title' => $title],
                [
                    'learning_material_category_id' => $category->id,
                    'type' => 'pdf',
                    'file_disk' => 'local',
                    'file_path' => $path,
                    'mime_type' => 'application/pdf',
                    'file_size' => Storage::disk('local')->size($path),
                    'status' => 'published',
                    'available_during_temporary' => true,
                    'sort_order' => $i,
                    'uploaded_by' => $admin?->id,
                ],
            );
        }
    }
}