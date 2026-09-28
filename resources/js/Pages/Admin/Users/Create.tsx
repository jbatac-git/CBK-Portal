import UserForm from '@/Components/Users/UserForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { UserFormOptions } from '@/types/user';
import { Head } from '@inertiajs/react';

export default function Create(options: UserFormOptions) {
    return (
        <AdminLayout title="New Employee">
            <Head title="New Employee" />

            <div className="max-w-3xl">
                <UserForm options={options} />
            </div>
        </AdminLayout>
    );
}