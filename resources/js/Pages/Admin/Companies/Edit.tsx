import LookupFormView from '@/Components/Lookups/LookupFormView';
import AdminLayout from '@/Layouts/AdminLayout';
import { LookupItem } from '@/types/lookup';
import { Head } from '@inertiajs/react';

export default function Edit({ item }: { item: LookupItem }) {
    return (
        <AdminLayout title="Edit Company">
            <Head title="Edit Company" />
            <LookupFormView routePrefix="admin.companies" item={item} />
        </AdminLayout>
    );
}