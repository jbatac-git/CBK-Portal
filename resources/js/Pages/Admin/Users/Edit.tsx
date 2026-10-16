import StatusBadge from '@/Components/Shared/StatusBadge';
import PageHeader from '@/Components/UI/PageHeader';
import UserForm from '@/Components/Users/UserForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Employee, UserFormOptions } from '@/types/user';
import { Head } from '@inertiajs/react';

export default function Edit({ employee, ...options }: UserFormOptions & { employee: Employee }) {
    return (
        <AdminLayout title="Edit employee">
            <Head title={`Edit ${employee.name}`} />

            <div className="max-w-3xl">
                <PageHeader
                    back={{ href: route('admin.users.index'), label: 'Users' }}
                    eyebrow="Edit employee"
                    title={employee.name}
                    description="Update this employee's details and portal access. Username and employee ID stay the same."
                    actions={<StatusBadge status={employee.status} label={employee.status_label} />}
                />

                <UserForm options={options} employee={employee} />
            </div>
        </AdminLayout>
    );
}
