<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardRedirectController extends Controller
{
    /**
     * After login everyone lands on /dashboard, which sends them to
     * the portal their permissions allow.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->can('admin.access')) {
            return redirect()->route('admin.dashboard');
        }

        if ($user->can('portal.access')) {
            return redirect()->route('portal.home');
        }

        abort(403, 'Your account has no assigned portal.');
    }
}