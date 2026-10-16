<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Frame shape for videos. Uploaded files are measured in the browser;
     * this is what embedded players (YouTube, Vimeo, Drive) are framed with.
     */
    public function up(): void
    {
        Schema::table('learning_materials', function (Blueprint $table) {
            $table->string('orientation', 10)->default('landscape')->after('external_url');
        });
    }

    public function down(): void
    {
        Schema::table('learning_materials', function (Blueprint $table) {
            $table->dropColumn('orientation');
        });
    }
};
