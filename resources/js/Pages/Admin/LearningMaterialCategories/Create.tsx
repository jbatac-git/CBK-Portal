import CategoryForm from '@/Components/Materials/CategoryForm';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <AdminLayout title="Add category">
            <Head title="Add category" />
            <div className="max-w-3xl">
                <PageHeader
                    back={{ href: route('admin.learning-material-categories.index'), label: 'Categories' }}
                    title="Add category"
                    description="Categories group learning materials in the Diser library."
                />
                <CategoryForm />
            </div>
        </AdminLayout>
    );
}
