<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\Portal\HomeController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'active'])->group(function () {

    Route::get('/dashboard', DashboardRedirectController::class)
        ->name('dashboard');

    Route::prefix('admin')
        ->name('admin.')
        ->middleware('permission:admin.access')
        ->group(function () {

            Route::get('/', DashboardController::class)
                ->name('dashboard');

            Route::resource('users', UserController::class)
                ->except(['show', 'destroy']);
        });

    Route::prefix('portal')
        ->name('portal.')
        ->middleware('permission:portal.access')
        ->group(function () {

            Route::get('/', HomeController::class)
                ->name('home');
        });
});

require __DIR__.'/auth.php';