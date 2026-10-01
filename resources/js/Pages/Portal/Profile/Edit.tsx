import ProfileForm from '@/Components/Profile/ProfileForm';
import DiserLayout from '@/Layouts/DiserLayout';
import { Head } from '@inertiajs/react';

export default function Edit({ profile }: { profile: any }) {
    return (
        <DiserLayout>
            <Head title="My Profile" />
            <h1 className="mb-1 text-lg font-medium text-maroon">My Profile</h1>
            <ProfileForm profile={profile} />
        </DiserLayout>
    );
}