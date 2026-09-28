<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\RemovalRequestController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserLifecycleController;
use App\Http\Controllers\Auth\ForcedPasswordController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\Portal\HomeController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'active'])->group(function () {
    // Reachable WHILE the "must change password" flag is set,
    // so they are deliberately outside the group below.
    Route::get('/password/change', [ForcedPasswordController::class, 'create'])->name('password.change');
    Route::post('/password/change', [ForcedPasswordController::class, 'store'])->name('password.change.store');

    Route::middleware(['password.changed', 'temporary.scope'])->group(function () {
        Route::get('/dashboard', DashboardRedirectController::class)->name('dashboard');

        Route::prefix('admin')->name('admin.')->middleware('permission:admin.access')->group(function () {
            Route::get('/', DashboardController::class)->name('dashboard');

            Route::resource('users', UserController::class)->except(['show', 'destroy']);

            Route::controller(UserLifecycleController::class)
                ->prefix('users/{user}')
                ->name('users.')
                ->group(function () {
                    Route::post('approve', 'approve')->name('approve');
                    Route::post('decline', 'decline')->name('decline');
                    Route::post('deactivate', 'deactivate')->name('deactivate');
                    Route::post('resend-credentials', 'resendCredentials')
                        ->middleware('throttle:5,1')
                        ->name('resend-credentials');
                });

            Route::post('users/{user}/removal-request', [RemovalRequestController::class, 'store'])
                ->name('users.removal-request');

            Route::controller(RemovalRequestController::class)
                ->prefix('removal-requests')
                ->name('removal-requests.')
                ->group(function () {
                    Route::get('/', 'index')->name('index');
                    Route::post('{removalRequest}/approve', 'approve')->name('approve');
                    Route::post('{removalRequest}/decline', 'decline')->name('decline');
                });
        });

        Route::prefix('portal')->name('portal.')->middleware('permission:portal.access')->group(function () {
            Route::get('/', HomeController::class)->name('home');
            // Phase 4+: learning, price lists, contact, profile
        });
    });
});

require __DIR__.'/auth.php';