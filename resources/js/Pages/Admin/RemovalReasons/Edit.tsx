import LookupFormView from '@/Components/Lookups/LookupFormView';
import AdminLayout from '@/Layouts/AdminLayout';
import { LookupItem } from '@/types/lookup';
import { Head } from '@inertiajs/react';

export default function Edit({ item }: { item: LookupItem }) {
    return (
        <AdminLayout title="Edit Removal Reason">
            <Head title="Edit Removal Reason" />
            <LookupFormView routePrefix="admin.removal-reasons" item={item} backHref={route('admin.maintenance.index', { tab: 'removal-reasons' })} />
        </AdminLayout>
    );
}