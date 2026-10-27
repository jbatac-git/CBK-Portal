<?php

namespace Tests\Feature\Settings;

use App\Enums\PriceListStatus;
use App\Enums\RoleName;
use App\Models\Company;
use App\Models\PriceList;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PriceListTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);
        Storage::fake('local');
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['company_id' => Company::factory()]);
        $user->assignRole($role->value);

        return $user;
    }

    public function test_admin_can_upload_a_price_list(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)->post(route('admin.price-lists.store'), [
            'title' => 'Q3 2026 Price List',
            'status' => 'active',
            'file' => $this->fakePdf('q3.pdf'),
        ])->assertRedirect();

        $priceList = PriceList::firstOrFail();
        $this->assertSame(PriceListStatus::Active, $priceList->status);
        // Private disk: only the logged-in file route can serve it.
        $this->assertSame('local', $priceList->file_disk);
        Storage::disk('local')->assertExists($priceList->file_path);
    }

    public function test_diser_only_sees_active_price_lists(): void
    {
        $diser = $this->userWithRole(RoleName::Diser);
        $diser->givePermissionTo('portal.price-lists');

        PriceList::factory()->create(['status' => 'active', 'title' => 'Active List']);
        PriceList::factory()->create(['status' => 'archived', 'title' => 'Old List']);

        $this->actingAs($diser)
            ->get(route('portal.price-lists.index'))
            ->assertInertia(fn ($page) => $page
                ->component('Portal/PriceLists/Index')
                ->has('priceLists', 1)
                ->where('priceLists.0.title', 'Active List'));
    }

    public function test_rejects_a_file_that_is_neither_a_pdf_nor_a_workbook(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)->post(route('admin.price-lists.store'), [
            'title' => 'Bad file',
            'status' => 'active',
            'file' => UploadedFile::fake()->image('not-a-pdf.pdf'),
        ])->assertSessionHas('error');

        $this->assertSame(0, PriceList::count());
    }

    public function test_hr_cannot_manage_price_lists(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);

        $this->actingAs($hr)->get(route('admin.price-lists.index'))->assertForbidden();
    }

    private function fakePdf(string $name = 'file.pdf'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>",
        );
    }
}
