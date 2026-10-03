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
    private const TABS = [
        'companies' => [
            'label' => 'Companies',
            'model' => Company::class,
            'relation' => 'users',
            'count_attribute' => 'users_count',
            'usage_label' => 'employee(s)',
            'route_prefix' => 'admin.companies',
        ],
        'departments' => [
            'label' => 'Departments',
            'model' => Department::class,
            'relation' => 'users',
            'count_attribute' => 'users_count',
            'usage_label' => 'employee(s)',
            'route_prefix' => 'admin.departments',
        ],
        'removal-reasons' => [
            'label' => 'Removal Reasons',
            'model' => RemovalReason::class,
            'relation' => 'removalRequests',
            'count_attribute' => 'removal_requests_count',
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
            'items' => $service->list($request->string('search')->toString() ?: null)
                ->through(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'is_active' => $item->is_active,
                    'usage_count' => $item->{$config['count_attribute']} ?? 0,
                ]),
            'filters' => $request->only('search'),
            'routePrefix' => $config['route_prefix'],
            'usageLabel' => $config['usage_label'],
        ]);
    }
}