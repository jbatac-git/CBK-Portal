import MaterialsGrid from '@/Components/Materials/MaterialsGrid';
import DiserLayout from '@/Layouts/DiserLayout';
import { PortalMaterial } from '@/types/material';
import { Head } from '@inertiajs/react';

export default function Index({ materials }: { materials: PortalMaterial[] }) {
    return (
        <DiserLayout>
            <Head title="Learning" />

            <h1 className="text-lg font-medium text-maroon">Learning Library</h1>
            <div className="mb-4 mt-1 h-1 w-10 bg-gold" />

            <MaterialsGrid materials={materials} />
        </DiserLayout>
    );
}