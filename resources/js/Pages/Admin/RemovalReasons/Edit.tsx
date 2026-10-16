import LookupFormView from '@/Components/Lookups/LookupFormView';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { LookupItem } from '@/types/lookup';
import { Head } from '@inertiajs/react';

export default function Edit({ item }: { item: LookupItem }) {
    const backHref = route('admin.maintenance.index', { tab: 'removal-reasons' });

    return (
        <AdminLayout title="Edit removal reason">
            <Head title="Edit removal reason" />
            <div className="max-w-xl">
                <PageHeader back={{ href: backHref, label: 'Removal reasons' }} eyebrow="Edit removal reason" title={item.name} description="Reasons that can be selected when requesting an account removal." />
                <LookupFormView routePrefix="admin.removal-reasons" item={item} backHref={backHref} />
            </div>
        </AdminLayout>
    );
}
