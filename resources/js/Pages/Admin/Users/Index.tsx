import Avatar from '@/Components/Shared/Avatar';
import Can from '@/Components/Shared/Can';
import StatusBadge from '@/Components/Shared/StatusBadge';
import Badge from '@/Components/UI/Badge';
import Button, { buttonClass } from '@/Components/UI/Button';
import PageHeader from '@/Components/UI/PageHeader';
import Pagination from '@/Components/UI/Pagination';
import Table, { EmptyRow, TBody, Td, Th, THead, Tr } from '@/Components/UI/Table';
import Toolbar, { FilterSelect, SearchInput } from '@/Components/UI/Toolbar';
import CredentialsEmailStatus from '@/Components/Users/CredentialsEmailStatus';
import RowActions from '@/Components/Users/RowActions';
import ViewProfileModal from '@/Components/Users/ViewProfileModal';
import AdminLayout from '@/Layouts/AdminLayout';
import { Paginated } from '@/types/pagination';
import { Employee, Option } from '@/types/user';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Users } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface IndexProps {
    users: Paginated<Employee>;
    filters: { search?: string; status?: string };
    statuses: Option[];
    removalReasons: Option[];
}

function DaysLeft({ days }: { days: number }) {
    const urgent = days <= 2;

    return (
        <span className={`tabular text-2xs ${urgent ? 'font-medium text-gold-700' : 'text-stone-500'}`}>
            {days} {days === 1 ? 'day' : 'days'} left
        </span>
    );
}

export default function Index({ users, filters, statuses, removalReasons }: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [viewing, setViewing] = useState<Employee | null>(null);

    // While an email is still sending, refresh the list quietly so its status updates by itself.
    const sending = users.data.some((u) => u.credentials_email?.status === 'queued');
    useEffect(() => {
        if (!sending) return;
        const timer = setInterval(() => router.reload({ only: ['users'] }), 5000);
        return () => clearInterval(timer);
    }, [sending]);

    const isFiltered = Boolean(filters.search || filters.status);

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();

        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;

        router.get(route('admin.users.index'), params, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="User management">
            <Head title="User management" />

            <PageHeader
                title="User management"
                description="Employee accounts, their status and what they can access."
                actions={
                    <Can permission="users.create">
                        <Link href={route('admin.users.create')} className={buttonClass('primary')}>
                            <Plus aria-hidden="true" />
                            Add employee
                        </Link>
                    </Can>
                }
            />

            <Toolbar onSubmit={applyFilters}>
                <SearchInput
                    id="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, username, ID or email"
                    className="sm:w-72"
                />

                <FilterSelect
                    id="status"
                    aria-label="Filter by status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">All statuses</option>
                    {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </FilterSelect>

                <Button type="submit" variant="secondary">
                    Filter
                </Button>
            </Toolbar>

            <Table footer={<Pagination paginator={users} />}>
                <THead>
                    <Th>Employee</Th>
                    <Th>Username</Th>
                    <Th>Employee ID</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th align="right">
                        <span className="sr-only">Actions</span>
                    </Th>
                </THead>
                <TBody>
                    {users.data.map((user) => (
                        <Tr key={user.id}>
                            <Td className="max-w-[18rem]">
                                <button
                                    type="button"
                                    onClick={() => setViewing(user)}
                                    aria-label={`View profile of ${user.name}`}
                                    className="group -mx-1 flex min-w-0 items-center gap-3 rounded-md px-1 py-0.5 text-left focus-visible:ring-2 focus-visible:ring-maroon-500/40"
                                >
                                    <Avatar
                                        name={user.name}
                                        photoUrl={user.photo_url}
                                        firstName={user.first_name}
                                        lastName={user.last_name}
                                        size="sm"
                                    />
                                    <span className="min-w-0">
                                        <span className="block truncate font-medium text-ink decoration-stone-300 underline-offset-4 group-hover:underline">
                                            {user.name}
                                        </span>
                                        <span className="block truncate text-[13px] text-stone-500">{user.email}</span>
                                    </span>
                                </button>
                            </Td>
                            <Td className="whitespace-nowrap font-mono text-[13px] text-stone-700">{user.username}</Td>
                            <Td className="tabular whitespace-nowrap font-mono text-[13px] text-stone-700">{user.employee_id}</Td>
                            <Td className="whitespace-nowrap">{user.role ?? <span className="text-stone-400">—</span>}</Td>
                            <Td>
                                <div className="flex flex-col items-start gap-1">
                                    <StatusBadge status={user.status} label={user.status_label} />
                                    {user.temporary_days_left !== null && <DaysLeft days={user.temporary_days_left} />}
                                    {user.credentials_email && (user.status === 'temporary' || user.credentials_email.status === 'failed') && (
                                        <CredentialsEmailStatus email={user.credentials_email} />
                                    )}
                                    {user.has_pending_removal && <Badge tone="warning">Removal pending</Badge>}
                                </div>
                            </Td>
                            <Td align="right">
                                <RowActions user={user} removalReasons={removalReasons} />
                            </Td>
                        </Tr>
                    ))}

                    {users.data.length === 0 && (
                        <EmptyRow
                            colSpan={6}
                            icon={Users}
                            title={isFiltered ? 'No employees match these filters' : 'No employees yet'}
                            hint={
                                isFiltered
                                    ? 'Try a different name, ID or status.'
                                    : 'Add an employee to create their account.'
                            }
                        />
                    )}
                </TBody>
            </Table>

            <ViewProfileModal employee={viewing} onClose={() => setViewing(null)} />
        </AdminLayout>
    );
}
