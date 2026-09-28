<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTemporaryAccessScope
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->isRestrictedToInitialMaterials()
            && ! $request->routeIs(config('portal.temporary_allowed_routes'))) {
            abort(403, 'This section becomes available once your account is approved.');
        }

        return $next($request);
    }
}