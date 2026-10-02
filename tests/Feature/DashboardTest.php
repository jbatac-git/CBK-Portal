<?php

namespace Tests\Feature;

use App\Enums\RoleName;
use App\Models\Company;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialCategory;
use App\Models\PriceList;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['company_id' => Company::factory()]);
        $user->assignRole($role->value);

        return $user;
    }

    public function test_hr_sees_only_user_related_stats(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);

        $this->actingAs($hr)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('stats.active_users')
                ->has('stats.pending_approval')
                ->missing('stats.published_materials')
                ->missing('stats.pending_removals'));
    }

    public function test_admin_sees_the_full_set_of_stats(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $category = LearningMaterialCategory::create(['name' => 'Core']);
        LearningMaterial::factory()->for($category, 'category')->create(['status' => 'published']);
        PriceList::factory()->create(['status' => 'active']);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('stats.active_users')
                ->has('stats.pending_removals')
                ->where('stats.published_materials', 1)
                ->where('stats.active_price_lists', 1));
    }
}