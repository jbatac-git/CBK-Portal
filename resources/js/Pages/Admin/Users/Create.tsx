import PageHeader from '@/Components/UI/PageHeader';
import UserForm from '@/Components/Users/UserForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { UserFormOptions } from '@/types/user';
import { Head } from '@inertiajs/react';

export default function Create(options: UserFormOptions) {
    return (
        <AdminLayout title="Add employee">
            <Head title="Add employee" />

            <div className="max-w-3xl">
                <PageHeader
                    back={{ href: route('admin.users.index'), label: 'Users' }}
                    title="Add employee"
                    description="Create a portal account. The employee receives their login details by email."
                />

                <UserForm options={options} />
            </div>
        </AdminLayout>
    );
}
