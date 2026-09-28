import Can from '@/Components/Shared/Can';
import StatusBadge from '@/Components/Shared/StatusBadge';
import { buttonClass } from '@/Components/UI/Button';
import Pagination from '@/Components/UI/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Paginated } from '@/types/pagination';
import { Employee, Option } from '@/types/user';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface IndexProps {
    users: Paginated<Employee>;
    filters: { search?: string; status?: string };
    statuses: Option[];
}

export default function Index({ users, filters, statuses }: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();

        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;

        router.get(route('admin.users.index'), params, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="User Management">
            <Head title="User Management" />

            <div className="flex flex-wrap items-end justify-between gap-3">
                <form onSubmit={applyFilters} className="flex flex-wrap items-center gap-2">
                    <label htmlFor="search" className="sr-only">Search employees</label>
                    <input
                        id="search"
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, username, ID, email"
                        className="w-64 max-w-full rounded-md border-stone-300 text-sm shadow-sm focus:border-maroon focus:ring-maroon"
                    />

                    <label htmlFor="status" className="sr-only">Filter by status</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-md border-stone-300 text-sm shadow-sm focus:border-maroon focus:ring-maroon"
                    >
                        <option value="">All statuses</option>
                        {statuses.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>

                    <button type="submit" className={buttonClass('secondary')}>Filter</button>
                </form>

                <Can permission="users.create">
                    <Link href={route('admin.users.create')} className={buttonClass('primary')}>
                        + New employee
                    </Link>
                </Can>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-medium">Employee</th>
                            <th scope="col" className="px-4 py-3 font-medium">Username</th>
                            <th scope="col" className="px-4 py-3 font-medium">Employee ID</th>
                            <th scope="col" className="px-4 py-3 font-medium">Role</th>
                            <th scope="col" className="px-4 py-3 font-medium">Status</th>
                            <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {users.data.map((user) => (
                            <tr key={user.id}>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-stone-900">{user.name}</div>
                                    <div className="text-xs text-stone-500">{user.email}</div>
                                </td>
                                <td className="px-4 py-3 text-stone-700">{user.username}</td>
                                <td className="px-4 py-3 text-stone-700">{user.employee_id}</td>
                                <td className="px-4 py-3 text-stone-700">{user.role ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={user.status} label={user.status_label} />
                                    {user.temporary_days_left !== null && (
                                        <div className="mt-1 text-xs text-stone-500">
                                            {user.temporary_days_left} day(s) left
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {user.can_update && (
                                        <Link href={route('admin.users.edit', user.id)} className="text-maroon underline">
                                            Edit
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {users.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                                    No employees found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination paginator={users} />
        </AdminLayout>
    );
}