<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ManagesLookupResource;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Lookups\CompanyRequest;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;

class CompanyController extends Controller
{
    use ManagesLookupResource;

    protected function lookupModel(): string
    {
        return Company::class;
    }

    protected function usageRelation(): string
    {
        return 'users';
    }

    protected function maintenanceTab(): string
    {
        return 'companies';
    }

    public function store(CompanyRequest $request): RedirectResponse
    {
        $this->lookupService()->create($request->validated());

        return $this->backToList('Company added.');
    }

    public function update(CompanyRequest $request, int $company): RedirectResponse
    {
        $this->lookupService()->update(Company::findOrFail($company), $request->validated());

        return $this->backToList('Company updated.');
    }
}
