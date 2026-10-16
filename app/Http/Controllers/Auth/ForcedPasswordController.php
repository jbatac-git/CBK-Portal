<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangeTemporaryPasswordRequest;
use App\Services\Users\SessionRevoker;
use App\Services\Users\UserAccountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ForcedPasswordController extends Controller
{
    public function __construct(private UserAccountService $accounts) {}

    public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->must_change_password) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/ChangePassword');
    }

    public function store(ChangeTemporaryPasswordRequest $request, SessionRevoker $sessions): RedirectResponse
    {
        $this->accounts->changePassword($request->user(), $request->validated('password'));

        // Whoever else used the temporary password is signed out now.
        $request->session()->regenerate();
        $sessions->revokeOthers($request->user(), $request->session()->getId());

        return redirect()->route('dashboard')->with('success', 'Your password has been updated.');
    }
}
