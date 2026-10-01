<?php

namespace App\Http\Controllers\Concerns;

use Closure;
use DomainException;
use Illuminate\Http\RedirectResponse;

trait RedirectsWithDomainErrors
{
    /**
     * Runs a service call. A DomainException (a broken business rule such as
     * "already deactivated") becomes a friendly flash error instead of a 500.
     */
    protected function attempt(Closure $action, string $success): RedirectResponse
    {
        try {
            $action();
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', $success);
    }
}