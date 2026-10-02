<?php

namespace App\Services\Lookups;

use DomainException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Shared CRUD logic for simple name+is_active lookup tables (Company,
 * Department, RemovalReason). Writing this once, parameterized by model
 * class and "in use" relation, is the DRY alternative to three nearly
 * identical copy-pasted services.
 */
class LookupService
{
    /**
     * @param  class-string<Model>  $modelClass
     * @param  string  $usageRelation  relation name to check before deleting (e.g. "users")
     */
    public function __construct(
        private string $modelClass,
        private string $usageRelation,
    ) {}

    public function list(?string $search, int $perPage = 15): LengthAwarePaginator
    {
        return $this->modelClass::query()
            ->when($search, fn ($q) => $q->where('name', 'ilike', "%{$search}%"))
            ->withCount($this->usageRelation)
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): Model
    {
        return $this->modelClass::create($data);
    }

    public function update(Model $record, array $data): Model
    {
        $record->update($data);

        return $record->fresh();
    }

    public function delete(Model $record): void
    {
        if ($record->{$this->usageRelation}()->exists()) {
            throw new DomainException('This item cannot be deleted because it is still in use.');
        }

        $record->delete();
    }
}