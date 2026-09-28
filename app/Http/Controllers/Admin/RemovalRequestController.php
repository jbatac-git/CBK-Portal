<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\RedirectsWithDomainErrors;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RemovalRequests\DeclineRequest;
use App\Http\Requests\Admin\RemovalRequests\SubmitRequest;
use App\Http\Resources\RemovalRequestResource;
use App\Models\RemovalRequest;
use App\Models\User;
use App\Services\Users\RemovalRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RemovalRequestController extends Controller
{
    use RedirectsWithDomainErrors;

    public function __construct(private RemovalRequestService $service) {}

    public function index(): Response
    {
        $this->authorize('viewAny', RemovalRequest::class);

        return Inertia::render('Admin/RemovalRequests/Index', [
            'requests' => RemovalRequestResource::collection($this->service->pending())->resolve(),
        ]);
    }

    public function store(SubmitRequest $request, User $user): RedirectResponse
    {
        return $this->attempt(
            fn () => $this->service->submit($user, $request->user(), $request->validated()),
            "The removal request for {$user->name} was sent to the administrators.",
        );
    }

    public function approve(Request $request, RemovalRequest $removalRequest): RedirectResponse
    {
        $this->authorize('process', $removalRequest);

        return $this->attempt(
            fn () => $this->service->approve($removalRequest, $request->user()),
            "{$removalRequest->user->name}'s account was deactivated.",
        );
    }

    public function decline(DeclineRequest $request, RemovalRequest $removalRequest): RedirectResponse
    {
        return $this->attempt(
            fn () => $this->service->decline($removalRequest, $request->user(), $request->validated('decision_note')),
            'The removal request was declined.',
        );
    }
}