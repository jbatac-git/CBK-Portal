<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Spatie\Permission\PermissionRegistrar;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Spatie's PermissionRegistrar is a container singleton that can
        // hold an in-memory, stale copy of the roles/permissions collection
        // across test methods, since RefreshDatabase resets the DATABASE
        // but not this in-memory cache. Clearing it here, for every single
        // test in the suite (not just inside our seeder), guarantees each
        // test starts with a registrar that will re-read from the
        // freshly-migrated database on its first permission check.
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}