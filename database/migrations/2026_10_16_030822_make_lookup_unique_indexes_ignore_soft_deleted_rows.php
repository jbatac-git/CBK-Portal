<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The lookup tables use soft deletes, but their plain unique indexes also
 * covered deleted rows, so re-adding a deleted name crashed with a
 * QueryException. Partial indexes keep uniqueness for live rows only,
 * which matches the `whereNull('deleted_at')` validation rules.
 */
return new class extends Migration
{
    /** @var array<string, string> table => column */
    private array $columns = [
        'companies' => 'name',
        'departments' => 'name',
        'removal_reasons' => 'slug',
    ];

    public function up(): void
    {
        foreach ($this->columns as $table => $column) {
            Schema::table($table, fn ($blueprint) => $blueprint->dropUnique([$column]));

            DB::statement(
                "CREATE UNIQUE INDEX {$table}_{$column}_unique ON {$table} ({$column}) WHERE deleted_at IS NULL"
            );
        }
    }

    public function down(): void
    {
        foreach ($this->columns as $table => $column) {
            DB::statement("DROP INDEX {$table}_{$column}_unique");

            Schema::table($table, fn ($blueprint) => $blueprint->unique($column));
        }
    }
};
