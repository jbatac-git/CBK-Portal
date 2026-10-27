<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per price list download. The downloader's name and username are
     * copied onto the row so a leaked file can still be traced if the account
     * is later removed.
     */
    public function up(): void
    {
        Schema::create('price_list_downloads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('price_list_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name');
            $table->string('username');
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['price_list_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_list_downloads');
    }
};
