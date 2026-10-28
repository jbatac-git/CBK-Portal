<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AccountStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Users\IndexUserRequest;
use App\Http\Requests\Admin\Users\StoreUserRequest;
use App\Http\Requests\Admin\Users\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\RemovalReason;
use App\Models\User;
use App\Services\Users\UserAccountService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private UserAccountService $service) {}

    public function index(IndexUserRequest $request): Response
    {
        $users = $this->service->list(
            $request->user(),
            $request->validated('search'),
            $request->validated('status'),
        );

        return Inertia::render('Admin/Users/Index', [
            'users' => $users->through(fn (User $user) => UserResource::make($user)->resolve()),
            'filters' => $request->only('search', 'status'),
            'statuses' => collect(AccountStatus::cases())
                ->map(fn (AccountStatus $s) => ['value' => $s->value, 'label' => $s->label()])
                ->values(),
            'removalReasons' => RemovalReason::active()->orderBy('name')->get()
                ->map(fn (RemovalReason $r) => ['value' => (string) $r->id, 'label' => $r->name])
                ->values(),
            // Add / edit happen in the side panel on this page.
            'formOptions' => $this->service->formOptions($request->user()),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = $this->service->create($request->validated(), $request->user());

        return back(fallback: route('admin.users.index'))
            ->with('success', "Account created for {$user->name} ({$user->username}). Temporary credentials will be emailed to {$user->email}.");
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->service->update($user, $request->validated(), $request->user());

        return back(fallback: route('admin.users.index'))
            ->with('success', "{$user->name}'s account was updated.");
    }
}
