<?php

namespace App\Http\Controllers\Concerns;

use App\Services\Lookups\LookupService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Shared index/create/edit/destroy for Company, Department, and
 * RemovalReason — all three are the same shape (name + is_active, protect
 * from deletion while in use), so this trait avoids writing the same
 * controller three times.
 */
trait ManagesLookupResource
{
    use RedirectsWithDomainErrors;

    abstract protected function lookupModel(): string;
    abstract protected function usageRelation(): string;
    abstract protected function pagePrefix(): string;
    abstract protected function routePrefix(): string;

    protected function lookupService(): LookupService
    {
        return new LookupService($this->lookupModel(), $this->usageRelation());
    }

    public function index(Request $request): Response
    {
        $items = $this->lookupService()->list($request->string('search')->toString() ?: null);

        return Inertia::render("{$this->pagePrefix()}/Index", [
            'items' => $items->through(fn (Model $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'is_active' => $item->is_active,
                'usage_count' => $item->{$this->usageRelation().'_count'} ?? 0,
            ]),
            'filters' => $request->only('search'),
            'routePrefix' => $this->routePrefix(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render("{$this->pagePrefix()}/Create", ['routePrefix' => $this->routePrefix()]);
    }

    public function edit(int $id): Response
    {
        $item = ($this->lookupModel())::findOrFail($id);

        return Inertia::render("{$this->pagePrefix()}/Edit", [
            'item' => ['id' => $item->id, 'name' => $item->name, 'is_active' => $item->is_active],
            'routePrefix' => $this->routePrefix(),
        ]);
    }

    public function destroy(int $id): RedirectResponse
    {
        $item = ($this->lookupModel())::findOrFail($id);

        return $this->attempt(fn () => $this->lookupService()->delete($item), 'Deleted.');
    }
}