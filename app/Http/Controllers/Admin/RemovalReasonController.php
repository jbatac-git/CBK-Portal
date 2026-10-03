<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ManagesLookupResource;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Lookups\RemovalReasonRequest;
use App\Models\RemovalReason;
use Illuminate\Http\RedirectResponse;

class RemovalReasonController extends Controller
{
    use ManagesLookupResource;

    protected function lookupModel(): string { return RemovalReason::class; }
    protected function usageRelation(): string { return 'removalRequests'; }
    protected function pagePrefix(): string { return 'Admin/RemovalReasons'; }
    protected function routePrefix(): string { return 'admin.removal-reasons'; }

   public function store(RemovalReasonRequest $request): RedirectResponse
{
    $this->lookupService()->create($request->validated());

    return redirect()->route('admin.maintenance.index', ['tab' => 'removal-reasons'])->with('success', 'Reason added.');
}

public function update(RemovalReasonRequest $request, int $removal_reason): RedirectResponse
{
    $this->lookupService()->update(RemovalReason::findOrFail($removal_reason), $request->validated());

    return redirect()->route('admin.maintenance.index', ['tab' => 'removal-reasons'])->with('success', 'Reason updated.');
}
}