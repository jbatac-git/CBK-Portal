import LookupFormView from '@/Components/Lookups/LookupFormView';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { LookupItem } from '@/types/lookup';
import { Head } from '@inertiajs/react';

export default function Edit({ item }: { item: LookupItem }) {
    const backHref = route('admin.maintenance.index', { tab: 'departments' });

    return (
        <AdminLayout title="Edit department">
            <Head title="Edit department" />
            <div className="max-w-xl">
                <PageHeader back={{ href: backHref, label: 'Departments' }} eyebrow="Edit department" title={item.name} description="Departments that employees can be assigned to." />
                <LookupFormView routePrefix="admin.departments" item={item} backHref={backHref} />
            </div>
        </AdminLayout>
    );
}
