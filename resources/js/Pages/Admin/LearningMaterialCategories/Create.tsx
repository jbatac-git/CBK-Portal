import CategoryForm from '@/Components/Materials/CategoryForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <AdminLayout title="New Category">
            <Head title="New Category" />
            <CategoryForm />
        </AdminLayout>
    );
}
