import LookupFormView from '@/Components/Lookups/LookupFormView';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <AdminLayout title="New Company">
            <Head title="New Company" />
            <LookupFormView routePrefix="admin.companies" />
        </AdminLayout>
    );
}