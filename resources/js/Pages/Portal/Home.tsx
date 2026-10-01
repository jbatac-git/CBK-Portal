import { usePermission } from '@/Hooks/usePermission';
import DiserLayout from '@/Layouts/DiserLayout';
import { Head } from '@inertiajs/react';
import MaterialsGrid from '@/Components/Materials/MaterialsGrid';
import { PortalMaterial } from '@/types/material';
export default function Home({ materials }: { materials: PortalMaterial[] }) {
    const { user } = usePermission();

    return (
        <DiserLayout>
            <Head title="Home" />

            <p className="text-sm text-stone-600">Welcome, {user.first_name}!</p>

            <section>
                <h1 className="text-3xl font-semibold leading-tight text-maroon">
                    Knowledge.
                    <br />
                    Tools.
                    <br />
                    Opportunities.
                </h1>
                <p className="mt-3 text-stone-700">
                    Everything you need,
                    <br />
                    all in one CBK Portal.
                </p>
                <div className="mt-3 h-1 w-12 bg-gold" />
            </section>

            <section>
                <h2 className="text-center text-lg font-medium text-maroon">Learn and grow with CBK</h2>
                <div className="mx-auto mt-1 h-1 w-10 bg-gold" />
                <div className="mt-4 rounded-lg border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
                   <MaterialsGrid materials={materials.slice(0, 8)} />
                </div>
            </section>
        </DiserLayout>
    );
}