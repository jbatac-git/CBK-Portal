<?php

use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\EnsurePasswordIsChanged;
use App\Http\Middleware\EnsureTemporaryAccessScope;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpFoundation\Response;

// use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'active' => EnsureAccountIsActive::class,
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'password.changed' => EnsurePasswordIsChanged::class,
            'temporary.scope' => EnsureTemporaryAccessScope::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // An upload bigger than PHP's post_max_size arrives with an empty body,
        // so validation never runs. Send the user back with a clear message.
        $exceptions->render(function (PostTooLargeException $e, Request $request) {
            return back()->with(
                'error',
                'The file is larger than the server accepts ('.ini_get('post_max_size').'). Use a video link for large videos, or ask IT to raise the upload limit.'
            );
        });

        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            $status = $response->getStatusCode();

            // CSRF token mismatch: send the user back with a friendly flash
            // message instead of a blank 419 page.
            if ($status === 419) {
                return back()->with('error', 'Your session expired. Please try again.');
            }

            // 403/404 are always intentional — brand them regardless of debug
            // mode. 500/503 stay as Laravel's full debug page locally (so we
            // can actually see the stack trace), and only get branded once
            // APP_DEBUG is false, i.e. in a real deployment.
            $shouldBrand = in_array($status, [403, 404], true)
                || (in_array($status, [500, 503], true) && ! config('app.debug'));

            if ($shouldBrand) {
                return Inertia::render('Error', ['status' => $status])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
