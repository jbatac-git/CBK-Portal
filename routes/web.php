<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\Portal\HomeController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

// Every authenticated route lives inside this group, so the
// "is the account still active?" check can never be forgotten.
Route::middleware(['auth', 'active'])->group(function () {
    // The route name "dashboard" is what Breeze redirects to after login.
    Route::get('/dashboard', DashboardRedirectController::class)->name('dashboard');

    Route::prefix('admin')->name('admin.')->middleware('permission:admin.access')->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');
        // Phase 2+: users, learning materials, price lists, contact us, settings
    });

    Route::prefix('portal')->name('portal.')->middleware('permission:portal.access')->group(function () {
        Route::get('/', HomeController::class)->name('home');
        // Phase 4+: learning, price lists, contact, profile
    });
});

require __DIR__.'/auth.php';