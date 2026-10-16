import LookupFormView from '@/Components/Lookups/LookupFormView';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create() {
    const backHref = route('admin.maintenance.index', { tab: 'departments' });

    return (
        <AdminLayout title="New department">
            <Head title="New department" />
            <div className="max-w-xl">
                <PageHeader back={{ href: backHref, label: 'Departments' }} title="New department" description="Departments that employees can be assigned to." />
                <LookupFormView routePrefix="admin.departments" backHref={backHref} submitLabel="Add department" />
            </div>
        </AdminLayout>
    );
}
