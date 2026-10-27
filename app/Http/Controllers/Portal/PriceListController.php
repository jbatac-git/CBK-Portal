<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\PriceList;
use App\Services\PriceLists\PriceListService;
use Inertia\Inertia;
use Inertia\Response;

class PriceListController extends Controller
{
    public function __invoke(PriceListService $service): Response
    {
        return Inertia::render('Portal/PriceLists/Index', [
            'priceLists' => $service->activeForPortal()->map(fn (PriceList $p) => [
                'id' => $p->id,
                'title' => $p->title,
                'effective_date' => $p->effective_date?->toDateString(),
                'file_url' => route('portal.price-lists.file', $p),
                'file_type' => $p->fileType()->extension(),
                'file_label' => $p->fileType()->label(),
            ]),
        ]);
    }
}
