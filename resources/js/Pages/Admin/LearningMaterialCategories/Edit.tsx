import CategoryForm from '@/Components/Materials/CategoryForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminCategory } from '@/types/material';
import { Head } from '@inertiajs/react';

export default function Edit({ category }: { category: AdminCategory }) {
    return (
        <AdminLayout title="Edit Category">
            <Head title="Edit Category" />
            <CategoryForm category={category} />
        </AdminLayout>
    );
}
