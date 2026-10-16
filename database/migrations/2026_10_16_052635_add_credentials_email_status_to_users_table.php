<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Delivery status of the latest temporary-credentials email, so HR and
     * Admin can see whether a new employee actually received it.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('credentials_email_status', 10)->nullable()->after('must_change_password');
            $table->timestamp('credentials_email_sent_at')->nullable()->after('credentials_email_status');
            $table->string('credentials_email_error', 500)->nullable()->after('credentials_email_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['credentials_email_status', 'credentials_email_sent_at', 'credentials_email_error']);
        });
    }
};
