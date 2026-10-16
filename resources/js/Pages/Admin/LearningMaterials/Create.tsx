import MaterialForm from '@/Components/Materials/MaterialForm';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { MaterialFormOptions } from '@/types/material';
import { Head } from '@inertiajs/react';

export default function Create(options: MaterialFormOptions) {
    return (
        <AdminLayout title="Add material">
            <Head title="Add material" />
            <div className="max-w-3xl">
                <PageHeader
                    back={{ href: route('admin.learning-materials.index'), label: 'Learning materials' }}
                    title="Add material"
                    description="Add a PDF, a training video or a video link to the Diser learning library."
                />
                <MaterialForm options={options} />
            </div>
        </AdminLayout>
    );
}
