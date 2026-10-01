<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Services\PriceLists\PriceListService;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PriceListController extends Controller
{
    public function __invoke(PriceListService $service): Response
    {
        return Inertia::render('Portal/PriceLists/Index', [
            'priceLists' => $service->activeForPortal()->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'effective_date' => $p->effective_date?->toDateString(),
                'file_url' => Storage::disk($p->file_disk)->url($p->file_path),
            ]),
        ]);
    }
}