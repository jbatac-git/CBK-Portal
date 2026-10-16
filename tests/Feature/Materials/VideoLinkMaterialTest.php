<?php

namespace Tests\Feature\Materials;

use App\Enums\MaterialType;
use App\Enums\RoleName;
use App\Models\Company;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialCategory;
use App\Models\User;
use App\Services\Materials\VideoEmbed;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class VideoLinkMaterialTest extends TestCase
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
        $this->category = LearningMaterialCategory::create(['name' => 'Product Training']);
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->assignRole($role->value);

        if ($role === RoleName::Diser) {
            $user->syncPermissions(['portal.learning', 'portal.price-lists', 'portal.contact-us']);
        }

        return $user;
    }

    private function payload(array $overrides = []): array
    {
        return [
            'learning_material_category_id' => $this->category->id,
            'title' => 'Product demo',
            'status' => 'published',
            'type' => 'video',
            'video_source' => 'link',
            'external_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            ...$overrides,
        ];
    }

    private function linkVideo(array $attributes = []): LearningMaterial
    {
        return LearningMaterial::factory()->for($this->category, 'category')->create([
            'type' => 'video',
            'status' => 'published',
            'external_url' => 'https://youtu.be/dQw4w9WgXcQ',
            'file_disk' => null,
            'file_path' => null,
            'mime_type' => null,
            'file_size' => null,
            ...$attributes,
        ]);
    }

    public function test_admin_can_create_a_youtube_link_video_without_a_file(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)
            ->post(route('admin.learning-materials.store'), $this->payload())
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.learning-materials.index'));

        $material = LearningMaterial::firstOrFail();

        $this->assertSame('https://www.youtube.com/watch?v=dQw4w9WgXcQ', $material->external_url);
        $this->assertNull($material->file_path);
        $this->assertNull($material->file_size);
        $this->assertEmpty(Storage::disk('local')->allFiles());

        // The admin list must render with null file fields.
        $this->actingAs($admin)
            ->get(route('admin.learning-materials.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('materials.data.0.type_label', 'Video link')
                ->where('materials.data.0.file_size_label', '—'));
    }

    public function test_a_link_from_an_unsupported_host_is_rejected(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)
            ->post(route('admin.learning-materials.store'), $this->payload(['external_url' => 'https://evil.example.com/watch?v=dQw4w9WgXcQ']))
            ->assertSessionHasErrors('external_url');

        $this->actingAs($admin)
            ->post(route('admin.learning-materials.store'), $this->payload(['external_url' => 'http://www.youtube.com/watch?v=dQw4w9WgXcQ']))
            ->assertSessionHasErrors('external_url');

        $this->assertSame(0, LearningMaterial::count());
    }

    public function test_a_pdf_cannot_be_a_link(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)
            ->post(route('admin.learning-materials.store'), $this->payload(['type' => 'pdf']))
            ->assertSessionHasErrors(['video_source', 'file']);

        $this->assertSame(0, LearningMaterial::count());
    }

    public function test_portal_show_returns_the_embed_and_no_stream_url_for_a_link_video(): void
    {
        $diser = $this->userWithRole(RoleName::Diser);
        $material = $this->linkVideo();

        $this->actingAs($diser)
            ->get(route('portal.learning.show', $material))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Portal/Learning/Show')
                ->where('material.embed.kind', 'youtube')
                ->where('material.embed.src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1')
                ->missing('material.stream_url'));
    }

    public function test_the_stream_route_404s_for_a_link_video(): void
    {
        $diser = $this->userWithRole(RoleName::Diser);
        $material = $this->linkVideo();

        $this->actingAs($diser)
            ->get(route('portal.learning.stream', $material))
            ->assertNotFound();
    }

    public function test_switching_from_upload_to_link_deletes_the_old_file(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        Storage::disk('local')->put('learning-materials/video/old.mp4', 'video-bytes');

        $material = LearningMaterial::factory()->for($this->category, 'category')->create([
            'type' => 'video',
            'file_path' => 'learning-materials/video/old.mp4',
            'mime_type' => 'video/mp4',
        ]);

        $this->actingAs($admin)
            ->put(route('admin.learning-materials.update', $material), $this->payload([
                'external_url' => 'https://vimeo.com/76979871',
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.learning-materials.index'));

        $material->refresh();
        $this->assertSame('https://vimeo.com/76979871', $material->external_url);
        $this->assertNull($material->file_path);
        Storage::disk('local')->assertMissing('learning-materials/video/old.mp4');
    }

    public function test_link_video_orientation_is_saved_and_sent_to_the_portal(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $diser = $this->userWithRole(RoleName::Diser);

        $this->actingAs($admin)
            ->post(route('admin.learning-materials.store'), $this->payload([
                'external_url' => 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
                'orientation' => 'portrait',
            ]))
            ->assertSessionHasNoErrors();

        $material = LearningMaterial::firstOrFail();
        $this->assertSame('portrait', $material->orientation);

        $this->actingAs($diser)
            ->get(route('portal.learning.show', $material))
            ->assertInertia(fn (Assert $page) => $page->where('material.orientation', 'portrait'));
    }

    public function test_an_unknown_orientation_is_rejected(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)
            ->post(route('admin.learning-materials.store'), $this->payload(['orientation' => 'square']))
            ->assertSessionHasErrors('orientation');
    }

    public function test_a_pdf_can_be_changed_into_a_video_link_on_edit(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        Storage::disk('local')->put('learning-materials/pdf/old.pdf', '%PDF-1.4');

        $material = LearningMaterial::factory()->for($this->category, 'category')->create([
            'type' => 'pdf',
            'file_path' => 'learning-materials/pdf/old.pdf',
            'mime_type' => 'application/pdf',
        ]);

        $this->actingAs($admin)
            ->put(route('admin.learning-materials.update', $material), $this->payload())
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.learning-materials.index'));

        $material->refresh();
        $this->assertSame(MaterialType::Video, $material->type);
        $this->assertSame('https://www.youtube.com/watch?v=dQw4w9WgXcQ', $material->external_url);
        Storage::disk('local')->assertMissing('learning-materials/pdf/old.pdf');
    }

    public function test_changing_a_pdf_into_a_video_file_requires_a_new_file(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $material = LearningMaterial::factory()->for($this->category, 'category')->create(['type' => 'pdf']);

        $this->actingAs($admin)
            ->put(route('admin.learning-materials.update', $material), $this->payload(['video_source' => 'upload', 'external_url' => null]))
            ->assertSessionHasErrors('file');

        $this->assertSame(MaterialType::Pdf, $material->fresh()->type);
    }

    public function test_switching_from_link_to_upload_requires_a_file(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $material = $this->linkVideo();

        $this->actingAs($admin)
            ->put(route('admin.learning-materials.update', $material), $this->payload(['video_source' => 'upload', 'external_url' => null]))
            ->assertSessionHasErrors('file');

        $this->assertNotNull($material->fresh()->external_url);
    }

    public function test_link_video_edit_keeps_the_link_when_no_source_is_sent(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);
        $material = $this->linkVideo();

        $payload = $this->payload(['title' => 'Renamed']);
        unset($payload['video_source'], $payload['external_url']);

        // No source sent: the material keeps its link, but the link itself
        // is still required, so an omitted URL is a validation error.
        $this->actingAs($admin)
            ->put(route('admin.learning-materials.update', $material), $payload)
            ->assertSessionHasErrors('external_url');

        $this->actingAs($admin)
            ->put(route('admin.learning-materials.update', $material), [...$payload, 'external_url' => $material->external_url])
            ->assertSessionHasNoErrors();

        $this->assertSame('Renamed', $material->fresh()->title);
    }

    public function test_an_upload_cannot_be_sent_together_with_a_link(): void
    {
        $admin = $this->userWithRole(RoleName::Admin);

        $this->actingAs($admin)
            ->post(route('admin.learning-materials.store'), $this->payload([
                'file' => UploadedFile::fake()->create('clip.mp4', 10, 'video/mp4'),
            ]))
            ->assertSessionHasErrors('file');
    }

    /** @return array<string, array{0: string, 1: ?array}> */
    public static function embedCases(): array
    {
        $yt = ['kind' => 'youtube', 'src' => 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'];

        return [
            'watch' => ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10', $yt],
            'mobile' => ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', $yt],
            'short link' => ['https://youtu.be/dQw4w9WgXcQ?si=abc', $yt],
            'embed' => ['https://www.youtube.com/embed/dQw4w9WgXcQ', $yt],
            'shorts' => ['https://youtube.com/shorts/dQw4w9WgXcQ', $yt],
            'vimeo' => ['https://vimeo.com/76979871', ['kind' => 'vimeo', 'src' => 'https://player.vimeo.com/video/76979871']],
            'vimeo player' => ['https://player.vimeo.com/video/76979871?h=x', ['kind' => 'vimeo', 'src' => 'https://player.vimeo.com/video/76979871']],
            'drive' => ['https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing', ['kind' => 'drive', 'src' => 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/preview']],
            'direct mp4' => ['https://cdn.example.com/videos/intro.mp4', ['kind' => 'direct', 'src' => 'https://cdn.example.com/videos/intro.mp4']],
            'youtube without id' => ['https://www.youtube.com/channel/abc', null],
            'http direct' => ['http://cdn.example.com/intro.mp4', null],
            'other host' => ['https://example.com/watch?v=dQw4w9WgXcQ', null],
            'javascript' => ['javascript:alert(1)', null],
        ];
    }

    #[DataProvider('embedCases')]
    public function test_video_embed_parses_supported_links(string $url, ?array $expected): void
    {
        $this->assertSame($expected, VideoEmbed::fromUrl($url));
    }
}
