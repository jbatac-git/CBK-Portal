<?php

namespace Tests\Feature\Users;

use App\Models\User;
use App\Services\Users\UsernameGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsernameGeneratorTest extends TestCase
{
    use RefreshDatabase;

    public function test_follows_the_official_format(): void
    {
        $this->assertSame('jbatac01', app(UsernameGenerator::class)->generate('Jhonel', 'Batac', '100001'));
    }

    public function test_cleans_spaces_accents_and_case(): void
    {
        $this->assertSame('mdelacruz07', app(UsernameGenerator::class)->generate('María', 'De La Cruz', '100007'));
    }

    public function test_widens_to_more_digits_on_collision(): void
    {
        User::factory()->create(['username' => 'jbatac01']);

        $this->assertSame('jbatac001', app(UsernameGenerator::class)->generate('Jhonel', 'Batac', '200001'));
    }

    public function test_soft_deleted_usernames_are_still_taken(): void
    {
        User::factory()->create(['username' => 'jbatac01'])->delete();

        $this->assertSame('jbatac001', app(UsernameGenerator::class)->generate('Jhonel', 'Batac', '200001'));
    }
}