<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, DashboardService $service): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => $service->statsFor($request->user()),
        ]);
    }
}