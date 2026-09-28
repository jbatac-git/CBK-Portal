<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\RedirectsWithDomainErrors;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Users\AccountLifecycleService;
use App\Services\Users\UserAccountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserLifecycleController extends Controller
{
    use RedirectsWithDomainErrors;

    public function __construct(
        private AccountLifecycleService $lifecycle,
        private UserAccountService $accounts,
    ) {}

    public function approve(Request $request, User $user): RedirectResponse
    {
        $this->authorize('approve', $user);

        return $this->attempt(
            fn () => $this->lifecycle->approve($user, $request->user()),
            "{$user->name}'s account has been approved.",
        );
    }

    public function decline(Request $request, User $user): RedirectResponse
    {
        $this->authorize('approve', $user);

        return $this->attempt(
            fn () => $this->lifecycle->decline($user, $request->user()),
            "{$user->name}'s account was not approved and is now restricted.",
        );
    }

    public function deactivate(Request $request, User $user): RedirectResponse
    {
        $this->authorize('deactivate', $user);

        return $this->attempt(
            fn () => $this->lifecycle->deactivate($user, $request->user()),
            "{$user->name}'s account was deactivated and signed out everywhere.",
        );
    }

    public function resendCredentials(User $user): RedirectResponse
    {
        $this->authorize('resendCredentials', $user);

        return $this->attempt(
            fn () => $this->accounts->resendCredentials($user),
            "New temporary credentials were emailed to {$user->email}.",
        );
    }
}