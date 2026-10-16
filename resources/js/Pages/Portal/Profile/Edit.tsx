import ProfileForm, { ProfileData } from '@/Components/Profile/ProfileForm';
import PageHeader from '@/Components/UI/PageHeader';
import DiserLayout from '@/Layouts/DiserLayout';
import { Head } from '@inertiajs/react';

export default function Edit({ profile }: { profile: ProfileData }) {
    return (
        <DiserLayout>
            <Head title="My profile" />

            <PageHeader title="My profile" description="Your photo, contact number and password." />

            <ProfileForm profile={profile} />
        </DiserLayout>
    );
}
