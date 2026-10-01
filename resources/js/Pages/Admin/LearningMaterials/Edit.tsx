import MaterialForm from '@/Components/Materials/MaterialForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminMaterial, MaterialFormOptions } from '@/types/material';
import { Head } from '@inertiajs/react';

export default function Edit({ material, ...options }: MaterialFormOptions & { material: AdminMaterial }) {
    return (
        <AdminLayout title="Edit Learning Material">
            <Head title={`Edit ${material.title}`} />
            <div className="max-w-2xl"><MaterialForm options={options} material={material} /></div>
        </AdminLayout>
    );
}