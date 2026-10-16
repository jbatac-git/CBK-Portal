<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A video material may now point to an external link (YouTube, Vimeo,
     * Google Drive or a direct .mp4/.webm) instead of an uploaded file, so
     * the file columns become nullable. Exactly one of file_path /
     * external_url is set; the Form Request + Service enforce that.
     */
    public function up(): void
    {
        Schema::table('learning_materials', function (Blueprint $table) {
            $table->string('external_url', 2048)->nullable()->after('type');

            $table->string('file_disk')->nullable()->default('local')->change();
            $table->string('file_path')->nullable()->change();
            $table->string('mime_type')->nullable()->change();
            $table->unsignedBigInteger('file_size')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Link-only materials cannot exist without the file columns, so they
        // are removed before the NOT NULL constraints come back.
        DB::table('learning_materials')->whereNull('file_path')->delete();

        Schema::table('learning_materials', function (Blueprint $table) {
            $table->dropColumn('external_url');

            $table->string('file_disk')->nullable(false)->default('local')->change();
            $table->string('file_path')->nullable(false)->change();
            $table->string('mime_type')->nullable(false)->change();
            $table->unsignedBigInteger('file_size')->nullable(false)->change();
        });
    }
};
