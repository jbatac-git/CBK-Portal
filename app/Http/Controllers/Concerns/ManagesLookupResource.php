<?php

namespace App\Http\Controllers\Concerns;

use App\Services\Lookups\LookupService;
use Illuminate\Http\RedirectResponse;

/**
 * Shared behaviour for Company, Department and RemovalReason: all three are the
 * same shape (name + is_active, protected from deletion while in use). They are
 * listed on the Maintenance page and added or edited in its side panel, so every
 * action returns to the Maintenance list it came from.
 */
trait ManagesLookupResource
{
    use RedirectsWithDomainErrors;

    abstract protected function lookupModel(): string;

    abstract protected function usageRelation(): string;

    /** The Maintenance tab this list lives on, e.g. "companies". */
    abstract protected function maintenanceTab(): string;

    protected function lookupService(): LookupService
    {
        return new LookupService($this->lookupModel(), $this->usageRelation());
    }

    /** Back to the Maintenance list the panel was opened from (keeping its search and page). */
    protected function backToList(string $message): RedirectResponse
    {
        return back(fallback: route('admin.maintenance.index', ['tab' => $this->maintenanceTab()]))->with('success', $message);
    }

    public function destroy(int $id): RedirectResponse
    {
        $item = ($this->lookupModel())::findOrFail($id);

        return $this->attempt(fn () => $this->lookupService()->delete($item), 'Deleted.');
    }
}
