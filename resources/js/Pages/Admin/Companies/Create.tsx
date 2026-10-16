import LookupFormView from '@/Components/Lookups/LookupFormView';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create() {
    const backHref = route('admin.maintenance.index', { tab: 'companies' });

    return (
        <AdminLayout title="New company">
            <Head title="New company" />
            <div className="max-w-xl">
                <PageHeader back={{ href: backHref, label: 'Companies' }} title="New company" description="Companies that employees can be assigned to." />
                <LookupFormView routePrefix="admin.companies" backHref={backHref} submitLabel="Add company" />
            </div>
        </AdminLayout>
    );
}
