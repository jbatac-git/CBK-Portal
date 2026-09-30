<?php

use App\Enums\MaterialStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_materials', function (Blueprint $table) {
            $table->id();

            $table->foreignId('learning_material_category_id')
                ->constrained('learning_material_categories')
                ->restrictOnDelete();

            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('type'); // pdf | video

            // Never trust a client-sent path. This is the server-generated,
            // private storage path — never exposed to the browser.
            $table->string('file_disk')->default('local');
            $table->string('file_path');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size'); // bytes

            $table->string('status')->default(MaterialStatus::Draft->value);
            $table->boolean('available_during_temporary')->default(false);
            $table->unsignedInteger('sort_order')->default(0);

            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'sort_order']);
            $table->index('available_during_temporary');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_materials');
    }
};