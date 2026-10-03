import LookupIndexView from '@/Components/Lookups/LookupIndexView';
import AdminLayout from '@/Layouts/AdminLayout';
import { LookupItem } from '@/types/lookup';
import { Paginated } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';

interface Tab {
    value: string;
    label: string;
}

interface MaintenanceProps {
    tab: string;
    tabs: Tab[];
    items: Paginated<LookupItem>;
    filters: { search?: string };
    routePrefix: string;
    usageLabel: string;
}

export default function Index({ tab, tabs, items, filters, routePrefix, usageLabel }: MaintenanceProps) {
    const switchTab = (value: string) => {
        router.get(route('admin.maintenance.index'), { tab: value }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Maintenance">
            <Head title="Maintenance" />

            <div className="mb-4 flex gap-1 border-b border-stone-200">
                {tabs.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => switchTab(t.value)}
                        className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${t.value === tab
                                ? 'border-maroon text-maroon'
                                : 'border-transparent text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <LookupIndexView
                title={tabs.find((t) => t.value === tab)?.label ?? ''}
                usageLabel={usageLabel}
                items={items}
                filters={filters}
                routePrefix={routePrefix}
                tab={tab}
            />
        </AdminLayout>
    );
}