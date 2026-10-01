<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PriceListStatus;
use App\Http\Controllers\Concerns\RedirectsWithDomainErrors;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PriceLists\StorePriceListRequest;
use App\Http\Requests\Admin\PriceLists\UpdatePriceListRequest;
use App\Models\PriceList;
use App\Services\PriceLists\PriceListService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PriceListController extends Controller
{
    use RedirectsWithDomainErrors;

    public function __construct(private PriceListService $service) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PriceList::class);

        $lists = $this->service->list(
            $request->string('search')->toString() ?: null,
            $request->string('status')->toString() ?: null,
        );

        return Inertia::render('Admin/PriceLists/Index', [
            'priceLists' => $lists->through(fn (PriceList $p) => [
                'id' => $p->id,
                'title' => $p->title,
                'effective_date' => $p->effective_date?->toDateString(),
                'status' => $p->status->value,
                'status_label' => $p->status->label(),
                'file_url' => \Illuminate\Support\Facades\Storage::disk($p->file_disk)->url($p->file_path),
                'uploaded_by' => $p->uploader?->name,
                'can_update' => $request->user()->can('update', $p),
                'can_archive' => $request->user()->can('archive', $p) && $p->status !== PriceListStatus::Archived,
            ]),
            'filters' => $request->only('search', 'status'),
            'statuses' => collect(PriceListStatus::cases())
                ->map(fn (PriceListStatus $s) => ['value' => $s->value, 'label' => $s->label()])->values(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', PriceList::class);

        return Inertia::render('Admin/PriceLists/Create');
    }

    public function store(StorePriceListRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $file = $request->file('file');
        unset($data['file']);

        return $this->attempt(
            fn () => $this->service->create($data, $file, $request->user()),
            'Price list uploaded.',
        );
    }

    public function edit(PriceList $priceList): Response
    {
        $this->authorize('update', $priceList);

        return Inertia::render('Admin/PriceLists/Edit', [
            'priceList' => [
                'id' => $priceList->id,
                'title' => $priceList->title,
                'effective_date' => $priceList->effective_date?->toDateString(),
                'status' => $priceList->status->value,
            ],
        ]);
    }

    public function update(UpdatePriceListRequest $request, PriceList $priceList): RedirectResponse
    {
        $data = $request->validated();
        $file = $request->file('file');
        unset($data['file']);

        return $this->attempt(
            fn () => $this->service->update($priceList, $data, $file),
            'Price list updated.',
        );
    }

    public function archive(PriceList $priceList): RedirectResponse
    {
        $this->authorize('archive', $priceList);

        return $this->attempt(fn () => $this->service->archive($priceList), 'Price list archived.');
    }
}