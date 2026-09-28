import { usePermission } from '@/Hooks/usePermission';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    const { user } = usePermission();

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="rounded-xl border border-t-4 border-stone-200 border-t-gold bg-white p-6">
                <h2 className="text-lg font-medium text-maroon">Welcome, {user.first_name}</h2>
                <p className="mt-1 text-sm text-stone-600">You are signed in as {user.roles.join(', ')}.</p>
            </div>
        </AdminLayout>
    );
}