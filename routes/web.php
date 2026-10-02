<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\RemovalRequestController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserLifecycleController;
use App\Http\Controllers\Auth\ForcedPasswordController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\Portal\HomeController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\LearningMaterialCategoryController;
use App\Http\Controllers\Admin\LearningMaterialController;
use App\Http\Controllers\Portal\LearningController;
use App\Http\Controllers\Portal\LearningMaterialStreamController;

use App\Http\Controllers\Admin\ContactUsController;
use App\Http\Controllers\Admin\PriceListController;
use App\Http\Controllers\Admin\RolePermissionsController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Portal\ContactController;
use App\Http\Controllers\Portal\PriceListController as PortalPriceListController;
use App\Http\Controllers\ProfileController;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'active'])->group(function () {
    // Reachable WHILE the "must change password" flag is set,
    // so they are deliberately outside the group below.
    Route::get('/password/change', [ForcedPasswordController::class, 'create'])->name('password.change');
    Route::post('/password/change', [ForcedPasswordController::class, 'store'])->name('password.change.store');

    Route::middleware(['password.changed', 'temporary.scope'])->group(function () {
        Route::get('/dashboard', DashboardRedirectController::class)->name('dashboard');
        Route::prefix('profile')->name('profile.')->group(function () {
            Route::get('/', [ProfileController::class, 'edit'])->name('edit');
            Route::put('/contact', [ProfileController::class, 'updateContact'])->name('contact.update');
            Route::post('/photo', [ProfileController::class, 'updatePhoto'])->name('photo.update');
            Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
        });

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

            // Ito ang dalawang linya para sa Phase 4 — i-verify na nandito talaga
            Route::resource('learning-material-categories', LearningMaterialCategoryController::class)->except(['show']);
            Route::resource('learning-materials', LearningMaterialController::class)->except(['show']);
            Route::post('learning-materials/{learning_material}/archive', [LearningMaterialController::class, 'archive'])
                ->name('learning-materials.archive');

            Route::resource('price-lists', PriceListController::class)->except(['show', 'destroy']);
            Route::post('price-lists/{price_list}/archive', [PriceListController::class, 'archive'])->name('price-lists.archive');

            Route::prefix('contact-us')->name('contact-us.')->middleware('permission:contact-us.manage')->group(function () {
                Route::get('/', [ContactUsController::class, 'edit'])->name('edit');
                Route::put('/', [ContactUsController::class, 'update'])->name('update');
            });

            Route::prefix('settings')->name('settings.')->middleware('permission:settings.manage')->group(function () {
                Route::get('/', [SettingsController::class, 'edit'])->name('index');
                Route::put('/', [SettingsController::class, 'update'])->name('update');
            });

            Route::prefix('roles-permissions')->name('roles-permissions.')->middleware('permission:roles.manage')->group(function () {
                Route::get('/', [RolePermissionsController::class, 'index'])->name('index');
                Route::put('/', [RolePermissionsController::class, 'update'])->name('update');
            });
        });

        Route::prefix('portal')->name('portal.')->middleware('permission:portal.access')->group(function () {
            Route::get('/', HomeController::class)->name('home');
            Route::prefix('learning')->name('learning.')->group(function () {
                Route::get('/', [LearningController::class, 'index'])->name('index');
                Route::get('{learningMaterial}', [LearningController::class, 'show'])->name('show');
                Route::get('{learningMaterial}/stream', LearningMaterialStreamController::class)->name('stream');
            });

            Route::get('price-lists', PortalPriceListController::class)->name('price-lists.index');
            Route::get('contact', ContactController::class)->name('contact.index');
        });
    });
});

require __DIR__ . '/auth.php';
