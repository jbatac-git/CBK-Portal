import LookupFormView from '@/Components/Lookups/LookupFormView';
import AdminLayout from '@/Layouts/AdminLayout';
import { LookupItem } from '@/types/lookup';
import { Head } from '@inertiajs/react';

export default function Edit({ item }: { item: LookupItem }) {
    return (
        <AdminLayout title="Edit Department">
            <Head title="Edit Department" />
            <LookupFormView routePrefix="admin.department" item={item} backHref={route('admin.maintenance.index', { tab: 'departments' })} />
        </AdminLayout>
    );
}