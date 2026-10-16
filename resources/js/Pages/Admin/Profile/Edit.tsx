import ProfileForm, { ProfileData } from '@/Components/Profile/ProfileForm';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Edit({ profile }: { profile: ProfileData }) {
    return (
        <AdminLayout title="My profile">
            <Head title="My profile" />

            <PageHeader title="My profile" description="Your photo, contact number and password." />

            <ProfileForm profile={profile} />
        </AdminLayout>
    );
}
