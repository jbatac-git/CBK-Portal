import LookupFormView from '@/Components/Lookups/LookupFormView';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <AdminLayout title="New Department">
            <Head title="New Department" />
            <LookupFormView routePrefix="admin.departments" backHref={route('admin.maintenance.index', { tab: 'departments' })} />
        </AdminLayout>
    );
}