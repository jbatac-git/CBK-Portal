import LookupIndexView, { sentenceCase, singular } from '@/Components/Lookups/LookupIndexView';
import { buttonClass } from '@/Components/UI/Button';
import PageHeader from '@/Components/UI/PageHeader';
import Tabs from '@/Components/UI/Tabs';
import AdminLayout from '@/Layouts/AdminLayout';
import { LookupItem } from '@/types/lookup';
import { Paginated } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';

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

            <PageHeader
                title="Maintenance"
                description="Reference lists used across CBK Academy: companies, departments and removal reasons."
                actions={
                    <Link href={route(`${routePrefix}.create`)} className={buttonClass('primary')}>
                        <Plus aria-hidden="true" />
                        Add {singular(tabs.find((t) => t.value === tab)?.label ?? '')}
                    </Link>
                }
            />

            <Tabs
                label="Reference lists"
                value={tab}
                onChange={switchTab}
                tabs={tabs.map((t) => ({ value: t.value, label: sentenceCase(t.label) }))}
            />

            {/* Keyed by tab so the search box resets when switching lists. */}
            <LookupIndexView
                key={tab}
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
