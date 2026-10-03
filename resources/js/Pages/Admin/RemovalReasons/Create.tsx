import LookupFormView from '@/Components/Lookups/LookupFormView';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <AdminLayout title="New Removal Reason">
            <Head title="New Removal Reason" />
            <LookupFormView routePrefix="admin.removal-reasons" backHref={route('admin.maintenance.index', { tab: 'removal-reasons' })} />
        </AdminLayout>
    );
}