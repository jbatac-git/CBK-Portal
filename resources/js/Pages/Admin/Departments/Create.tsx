import LookupFormView from '@/Components/Lookups/LookupFormView';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create() {
    const backHref = route('admin.maintenance.index', { tab: 'departments' });

    return (
        <AdminLayout title="Add department">
            <Head title="Add department" />
            <div className="max-w-3xl">
                <PageHeader back={{ href: backHref, label: 'Departments' }} title="Add department" description="Departments that employees can be assigned to." />
                <LookupFormView routePrefix="admin.departments" backHref={backHref} submitLabel="Add department" />
            </div>
        </AdminLayout>
    );
}
