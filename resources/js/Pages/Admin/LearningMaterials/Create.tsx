import MaterialForm from '@/Components/Materials/MaterialForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { MaterialFormOptions } from '@/types/material';
import { Head } from '@inertiajs/react';

export default function Create(options: MaterialFormOptions) {
    return (
        <AdminLayout title="Upload Learning Material">
            <Head title="Upload Learning Material" />
            <div className="max-w-2xl"><MaterialForm options={options} /></div>
        </AdminLayout>
    );
}