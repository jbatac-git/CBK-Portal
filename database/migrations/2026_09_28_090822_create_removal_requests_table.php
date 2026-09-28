<?php

use App\Enums\RemovalRequestStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('removal_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('requested_by')->constrained('users')->restrictOnDelete();
            $table->string('reason');
            $table->text('details')->nullable();
            $table->string('status')->default(RemovalRequestStatus::Pending->value)->index();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->text('decision_note')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // A PARTIAL unique index (PostgreSQL feature): uniqueness applies only
        // to pending rows, so an employee can have many past requests
        // but never two pending ones. Even a race condition cannot break this.
        DB::statement(
            "CREATE UNIQUE INDEX removal_requests_one_pending_per_user
             ON removal_requests (user_id)
             WHERE status = 'pending' AND deleted_at IS NULL"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('removal_requests');
    }
};