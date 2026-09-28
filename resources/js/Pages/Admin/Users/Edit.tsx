import UserForm from '@/Components/Users/UserForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Employee, UserFormOptions } from '@/types/user';
import { Head } from '@inertiajs/react';

export default function Edit({ employee, ...options }: UserFormOptions & { employee: Employee }) {
    return (
        <AdminLayout title="Edit Employee">
            <Head title={`Edit ${employee.name}`} />

            <div className="max-w-3xl">
                <UserForm options={options} employee={employee} />
            </div>
        </AdminLayout>
    );
}