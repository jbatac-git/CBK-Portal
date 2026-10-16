import CategoryForm from '@/Components/Materials/CategoryForm';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminCategory } from '@/types/material';
import { Head } from '@inertiajs/react';

export default function Edit({ category }: { category: AdminCategory }) {
    return (
        <AdminLayout title="Edit category">
            <Head title="Edit category" />
            <div className="max-w-3xl">
                <PageHeader
                    back={{ href: route('admin.learning-material-categories.index'), label: 'Categories' }}
                    eyebrow="Edit category"
                    title={category.name}
                    description="Rename the category or hide it from Disers."
                />
                <CategoryForm category={category} />
            </div>
        </AdminLayout>
    );
}
