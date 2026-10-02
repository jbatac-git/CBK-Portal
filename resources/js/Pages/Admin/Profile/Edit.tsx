import ProfileForm from '@/Components/Profile/ProfileForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Edit({ profile }: { profile: any }) {
    return (
        <AdminLayout title="My Profile">
            <Head title="My Profile" />
            <div className="max-w-xl"><ProfileForm profile={profile} /></div>
        </AdminLayout>
    );
}