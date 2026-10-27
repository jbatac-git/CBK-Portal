<?php

namespace App\Http\Controllers;

use App\Models\PriceList;
use App\Services\PriceLists\PriceListService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves a price list file to admins (admin.price-lists.file) and Disers
 * (portal.price-lists.file). Files live on the private disk, so this logged
 * and authorized route is the only way to open them.
 */
class PriceListFileController extends Controller
{
    public function __invoke(Request $request, PriceList $priceList, PriceListService $service): Response
    {
        $this->authorize('download', $priceList);

        return $service->download($priceList, $request->user(), $request->ip());
    }
}
