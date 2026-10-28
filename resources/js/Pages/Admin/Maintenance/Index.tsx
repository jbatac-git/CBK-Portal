import LookupFormView from '@/Components/Lookups/LookupFormView';
import LookupIndexView, { sentenceCase, singular } from '@/Components/Lookups/LookupIndexView';
import Button from '@/Components/UI/Button';
import PageHeader from '@/Components/UI/PageHeader';
import SidePanel from '@/Components/UI/SidePanel';
import Tabs from '@/Components/UI/Tabs';
import { usePanel } from '@/Hooks/usePanel';
import AdminLayout from '@/Layouts/AdminLayout';
import { LookupItem } from '@/types/lookup';
import { Paginated } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
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

/** Add (no item) or edit (an item) in the side panel. */
type PanelData = { item: LookupItem | null };

export default function Index({ tab, tabs, items, filters, routePrefix, usageLabel }: MaintenanceProps) {
    const panel = usePanel<PanelData>();
    const title = tabs.find((t) => t.value === tab)?.label ?? '';
    const noun = singular(title);

    const switchTab = (value: string) => {
        panel.close();
        router.get(route('admin.maintenance.index'), { tab: value }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Maintenance">
            <Head title="Maintenance" />

            <PageHeader
                title="Maintenance"
                description="Reference lists used across CBK Academy: companies, departments and removal reasons."
                actions={
                    <Button onClick={() => panel.show({ item: null })}>
                        <Plus aria-hidden="true" />
                        Add {noun}
                    </Button>
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
                title={title}
                usageLabel={usageLabel}
                items={items}
                filters={filters}
                routePrefix={routePrefix}
                tab={tab}
                onEdit={(item) => panel.show({ item })}
            />

            <SidePanel open={panel.open} onClose={panel.close} size="md">
                {panel.data && (
                    <LookupFormView key={panel.key} routePrefix={routePrefix} noun={noun} item={panel.data.item ?? undefined} onDone={panel.close} />
                )}
            </SidePanel>
        </AdminLayout>
    );
}
