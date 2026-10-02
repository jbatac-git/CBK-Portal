<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Department;
use App\Models\RemovalReason;
use App\Services\Lookups\LookupService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    /**
     * Single source of truth para sa tatlong "simple lookup" table na
     * pinamamahalaan ng page na ito. Kapag magdadagdag ng ika-apat sa
     * hinaharap, isang entry lang dito ang idadagdag — hindi na kailangan
     * ng bagong Controller o bagong sidebar item.
     */
    private const TABS = [
        'companies' => [
            'label' => 'Companies',
            'model' => Company::class,
            'relation' => 'users',
            'usage_label' => 'employee(s)',
            'route_prefix' => 'admin.companies',
        ],
        'departments' => [
            'label' => 'Departments',
            'model' => Department::class,
            'relation' => 'users',
            'usage_label' => 'employee(s)',
            'route_prefix' => 'admin.departments',
        ],
        'removal-reasons' => [
            'label' => 'Removal Reasons',
            'model' => RemovalReason::class,
            'relation' => 'removalRequests',
            'usage_label' => 'request(s)',
            'route_prefix' => 'admin.removal-reasons',
        ],
    ];

    public function index(Request $request): Response
    {
        $this->authorize('settings.manage');

        $tab = $request->string('tab')->toString();

        if (! array_key_exists($tab, self::TABS)) {
            $tab = 'companies';
        }

        $config = self::TABS[$tab];
        $service = new LookupService($config['model'], $config['relation']);

        return Inertia::render('Admin/Maintenance/Index', [
            'tab' => $tab,
            'tabs' => collect(self::TABS)->map(fn ($c, $key) => [
                'value' => $key,
                'label' => $c['label'],
            ])->values(),
            'items' => $service->list($request->string('search')->toString() ?: null),
            'filters' => $request->only('search'),
            'routePrefix' => $config['route_prefix'],
            'usageLabel' => $config['usage_label'],
        ]);
    }
}