import LookupIndexView from '@/Components/Lookups/LookupIndexView';
import AdminLayout from '@/Layouts/AdminLayout';
import { Paginated } from '@/types/pagination';
import { LookupItem } from '@/types/lookup';
import { Head } from '@inertiajs/react';

export default function Index({ items, filters }: { items: Paginated<LookupItem>; filters: { search?: string } }) {
    return (
        <AdminLayout title="Companies">
            <Head title="Companies" />
            <LookupIndexView title="Companies" usageLabel="employee(s)" items={items} filters={filters} routePrefix="admin.companies" />
        </AdminLayout>
    );
}