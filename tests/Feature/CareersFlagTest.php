<?php

namespace Tests\Feature;

use App\Enums\RoleName;
use App\Models\Company;
use App\Models\User;
use App\Services\Settings\PortalSettingService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CareersFlagTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_careers_page_is_blocked_until_the_flag_is_enabled(): void
    {
        $diser = User::factory()->create(['company_id' => Company::factory()]);
        $diser->assignRole(RoleName::Diser->value);

        $this->actingAs($diser)->get(route('portal.careers.index'))->assertNotFound();

        app(PortalSettingService::class)->setMany([PortalSettingService::CAREERS_KEY => '1']);

        $this->actingAs($diser)->get(route('portal.careers.index'))->assertOk();
    }
}