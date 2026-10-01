<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RoleName;
use App\Http\Controllers\Concerns\RedirectsWithDomainErrors;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateRolePermissionsRequest;
use App\Services\Settings\RolePermissionMatrixService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RolePermissionsController extends Controller
{
    use RedirectsWithDomainErrors;

    public function __construct(private RolePermissionMatrixService $service) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Settings/RolePermissions', $this->service->matrix());
    }

    public function update(UpdateRolePermissionsRequest $request): RedirectResponse
    {
        $role = RoleName::from($request->validated('role'));

        return $this->attempt(
            fn () => $this->service->update($role, $request->validated('permissions', [])),
            "{$role->value} permissions updated.",
        );
    }
}