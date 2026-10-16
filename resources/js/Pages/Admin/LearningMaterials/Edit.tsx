import MaterialForm from '@/Components/Materials/MaterialForm';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminMaterial, MaterialFormOptions } from '@/types/material';
import { Head } from '@inertiajs/react';

export default function Edit({ material, ...options }: MaterialFormOptions & { material: AdminMaterial }) {
    return (
        <AdminLayout title="Edit material">
            <Head title={`Edit ${material.title}`} />
            <div className="max-w-3xl">
                <PageHeader
                    back={{ href: route('admin.learning-materials.index'), label: 'Learning materials' }}
                    eyebrow="Edit material"
                    title={material.title}
                    description="Update the details, replace the file or change who can see it."
                />
                <MaterialForm options={options} material={material} />
            </div>
        </AdminLayout>
    );
}
