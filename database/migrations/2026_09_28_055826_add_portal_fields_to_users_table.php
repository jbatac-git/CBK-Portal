<?php

use App\Enums\AccountStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('name');

            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('username')->unique();
            $table->string('employee_id')->unique();

            $table->foreignId('company_id')->constrained('companies')->restrictOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->restrictOnDelete();

            $table->string('status')->default(AccountStatus::Temporary->value)->index();
            $table->timestamp('temporary_access_expires_at')->nullable();

            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['status', 'temporary_access_expires_at']);
            $table->dropConstrainedForeignId('department_id');
            $table->dropConstrainedForeignId('company_id');
            $table->dropColumn(['first_name', 'middle_name', 'last_name', 'username', 'employee_id']);
            $table->string('name')->default('');
        });
    }
};