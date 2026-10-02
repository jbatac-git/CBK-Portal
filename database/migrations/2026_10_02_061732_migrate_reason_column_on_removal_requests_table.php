<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $defaults = [
            'resigned' => 'Resigned',
            'awol' => 'AWOL',
            'separated' => 'Separated from the company',
        ];

        $ids = [];
        foreach ($defaults as $slug => $name) {
            $ids[$slug] = DB::table('removal_reasons')->insertGetId([
                'name' => $name,
                'slug' => $slug,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::table('removal_requests', function (Blueprint $table) {
            $table->foreignId('removal_reason_id')->nullable()->after('requested_by')
                ->constrained('removal_reasons')->restrictOnDelete();
        });

        // Backfill existing rows using the old string column before it's dropped.
        foreach ($ids as $slug => $id) {
            DB::table('removal_requests')->where('reason', $slug)->update(['removal_reason_id' => $id]);
        }

        Schema::table('removal_requests', function (Blueprint $table) {
            $table->dropColumn('reason');
        });
    }

    public function down(): void
    {
        Schema::table('removal_requests', function (Blueprint $table) {
            $table->string('reason')->nullable();
            $table->dropConstrainedForeignId('removal_reason_id');
        });
    }
};