import LookupFormView from '@/Components/Lookups/LookupFormView';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create() {
    const backHref = route('admin.maintenance.index', { tab: 'removal-reasons' });

    return (
        <AdminLayout title="New removal reason">
            <Head title="New removal reason" />
            <div className="max-w-xl">
                <PageHeader back={{ href: backHref, label: 'Removal reasons' }} title="New removal reason" description="Reasons that can be selected when requesting an account removal." />
                <LookupFormView routePrefix="admin.removal-reasons" backHref={backHref} submitLabel="Add removal reason" />
            </div>
        </AdminLayout>
    );
}
