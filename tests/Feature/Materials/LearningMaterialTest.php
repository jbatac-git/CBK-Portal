<?php

namespace Tests\Feature\Materials;

use App\Enums\MaterialStatus;
use App\Enums\RoleName;
use App\Models\Company;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LearningMaterialTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private LearningMaterialCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);
        Storage::fake('local');

        $this->company = Company::factory()->create();
        $this->category = LearningMaterialCategory::create(['name' => 'Company Overview']);
    }

    private function userWithRole(RoleName $role, array $attributes = []): User
    {
        $user = User::factory()->create(['company_id' => $this->company->id, ...$attributes]);
        $user->assignRole($role->value);

        if ($role === RoleName::Diser) {
            $user->syncPermissions(['portal.learning', 'portal.price-lists', 'portal.contact-us']);
        }

        return $user;
    }

   private function fakePdf(string $name = 'overview.pdf'): UploadedFile
{
    return UploadedFile::fake()->createWithContent(
        $name,
        "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>",
    );
}

    public function test_admin_can_upload_a_published_pdf(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)->post(route('admin.learning-materials.store'), [
            'learning_material_category_id' => $this->category->id,
            'title' => 'Company Overview',
            'status' => 'published',
            'type' => 'pdf',
            'available_during_temporary' => true,
            'file' => $this->fakePdf(),
        ])->assertRedirect(route('admin.learning-materials.index'));

        $material = LearningMaterial::firstOrFail();

        $this->assertSame(MaterialStatus::Published, $material->status);
        $this->assertTrue($material->available_during_temporary);
        Storage::disk('local')->assertExists($material->file_path);
    }

    public function test_rejects_a_file_whose_content_does_not_match_its_declared_type(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);

        // A .pdf extension, but the actual bytes are a JPEG.
        $fakeFile = UploadedFile::fake()->image('not-a-pdf.pdf');

        $this->actingAs($admin)->post(route('admin.learning-materials.store'), [
            'learning_material_category_id' => $this->category->id,
            'title' => 'Suspicious file',
            'status' => 'draft',
            'type' => 'pdf',
            'file' => $fakeFile,
        ])->assertSessionHas('error');

        $this->assertSame(0, LearningMaterial::count());
    }

    public function test_diser_only_sees_published_materials(): void
    {
        $diser = $this->userWithRole(RoleName::Diser);

        $draft = LearningMaterial::factory()->for($this->category, 'category')->create(['status' => 'draft']);
        $published = LearningMaterial::factory()->for($this->category, 'category')->create(['status' => 'published']);

        $this->actingAs($diser)
            ->get(route('portal.learning.show', $published))
            ->assertOk();

        $this->actingAs($diser)
            ->get(route('portal.learning.show', $draft))
            ->assertForbidden();
    }

    public function test_temporary_diser_cannot_stream_a_locked_material_even_via_direct_url(): void
    {
        $temporary = $this->userWithRole(RoleName::Diser, [
            'status' => 'temporary',
            'temporary_access_expires_at' => now()->addDays(5),
        ]);

        $locked = LearningMaterial::factory()->for($this->category, 'category')->create([
            'status' => 'published',
            'available_during_temporary' => false,
        ]);

        $unlocked = LearningMaterial::factory()->for($this->category, 'category')->create([
            'status' => 'published',
            'available_during_temporary' => true,
        ]);

        // The factory only sets a file_path string; the actual bytes must
        // exist on the fake disk, or the streamer correctly 404s.
        Storage::disk('local')->put($unlocked->file_path, '%PDF-1.4 fake content');

        $this->actingAs($temporary)->get(route('portal.learning.stream', $locked))->assertForbidden();
        $this->actingAs($temporary)->get(route('portal.learning.stream', $unlocked))->assertOk();
    }

    public function test_stream_supports_range_requests_for_video_seeking(): void
    {
        $diser = $this->userWithRole(RoleName::Diser);

        $material = LearningMaterial::factory()->for($this->category, 'category')->create([
            'status' => 'published',
            'type' => 'video',
            'file_path' => 'learning-materials/video/sample.mp4',
            'mime_type' => 'video/mp4',
            'file_size' => 1000,
        ]);

        Storage::disk('local')->put($material->file_path, str_repeat('a', 1000));

        $response = $this->actingAs($diser)
            ->withHeaders(['Range' => 'bytes=100-199'])
            ->get(route('portal.learning.stream', $material));

        $response->assertStatus(206);
        $response->assertHeader('Content-Range', 'bytes 100-199/1000');
        $this->assertSame(100, strlen($response->streamedContent()));
    }

    public function test_category_with_materials_cannot_be_deleted(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        LearningMaterial::factory()->for($this->category, 'category')->create();

        $this->actingAs($admin)
            ->delete(route('admin.learning-material-categories.destroy', $this->category))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('learning_material_categories', ['id' => $this->category->id, 'deleted_at' => null]);
    }

    public function test_hr_cannot_manage_learning_materials(): void
    {
        $hr = $this->userWithRole(RoleName::Hr);

        $this->actingAs($hr)->get(route('admin.learning-materials.index'))->assertForbidden();
    }
}
