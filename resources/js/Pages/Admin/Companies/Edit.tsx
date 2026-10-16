import LookupFormView from '@/Components/Lookups/LookupFormView';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { LookupItem } from '@/types/lookup';
import { Head } from '@inertiajs/react';

export default function Edit({ item }: { item: LookupItem }) {
    const backHref = route('admin.maintenance.index', { tab: 'companies' });

    return (
        <AdminLayout title="Edit company">
            <Head title="Edit company" />
            <div className="max-w-xl">
                <PageHeader back={{ href: backHref, label: 'Companies' }} eyebrow="Edit company" title={item.name} description="Companies that employees can be assigned to." />
                <LookupFormView routePrefix="admin.companies" item={item} backHref={backHref} />
            </div>
        </AdminLayout>
    );
}
