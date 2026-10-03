<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ManagesLookupResource;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Lookups\DepartmentRequest;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;

class DepartmentController extends Controller
{
    use ManagesLookupResource;

    protected function lookupModel(): string { return Department::class; }
    protected function usageRelation(): string { return 'users'; }
    protected function pagePrefix(): string { return 'Admin/Departments'; }
    protected function routePrefix(): string { return 'admin.departments'; }

public function store(DepartmentRequest $request): RedirectResponse
{
    $this->lookupService()->create($request->validated());

    return redirect()->route('admin.maintenance.index', ['tab' => 'departments'])->with('success', 'Department added.');
}

public function update(DepartmentRequest $request, int $department): RedirectResponse
{
    $this->lookupService()->update(Department::findOrFail($department), $request->validated());

    return redirect()->route('admin.maintenance.index', ['tab' => 'departments'])->with('success', 'Department updated.');
}
}