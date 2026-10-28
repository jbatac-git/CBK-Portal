import Avatar from '@/Components/Shared/Avatar';
import Can from '@/Components/Shared/Can';
import StatusBadge from '@/Components/Shared/StatusBadge';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import PageHeader from '@/Components/UI/PageHeader';
import Pagination from '@/Components/UI/Pagination';
import SidePanel from '@/Components/UI/SidePanel';
import Table, { EmptyRow, TBody, Td, Th, THead, Tr } from '@/Components/UI/Table';
import Toolbar, { FilterSelect, SearchInput } from '@/Components/UI/Toolbar';
import CredentialsEmailStatus from '@/Components/Users/CredentialsEmailStatus';
import EmployeeDetails from '@/Components/Users/EmployeeDetails';
import UserForm from '@/Components/Users/UserForm';
import { usePanel } from '@/Hooks/usePanel';
import { usePermission } from '@/Hooks/usePermission';
import AdminLayout from '@/Layouts/AdminLayout';
import { Paginated } from '@/types/pagination';
import { Employee, Option, UserFormOptions } from '@/types/user';
import { Head, router } from '@inertiajs/react';
import { ChevronRight, Plus, Users } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface IndexProps {
    users: Paginated<Employee>;
    filters: { search?: string; status?: string };
    statuses: Option[];
    removalReasons: Option[];
    formOptions: UserFormOptions;
}

/**
 * What the side panel shows. `snapshot` is the row as it was when opened; the
 * live row from `users` is preferred, so the panel updates after every action.
 */
type PanelData = { mode: 'create' } | { mode: 'view' | 'edit'; snapshot: Employee };

function DaysLeft({ days }: { days: number }) {
    const urgent = days <= 2;

    return (
        <span className={`tabular text-2xs ${urgent ? 'font-medium text-gold-700' : 'text-stone-500'}`}>
            {days} {days === 1 ? 'day' : 'days'} left
        </span>
    );
}

export default function Index({ users, filters, statuses, removalReasons, formOptions }: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const panel = usePanel<PanelData>();
    const { can } = usePermission();

    // While an email is still sending, refresh the list quietly so its status updates by itself.
    const sending = users.data.some((u) => u.credentials_email?.status === 'queued');
    useEffect(() => {
        if (!sending) return;
        const timer = setInterval(() => router.reload({ only: ['users'] }), 5000);
        return () => clearInterval(timer);
    }, [sending]);

    // "Add employee" elsewhere (e.g. the Dashboard) links here with ?create=1.
    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get('create') !== '1') return;

        url.searchParams.delete('create');
        router.replace({ url: url.pathname + url.search, preserveState: true, preserveScroll: true });
        if (can('users.create')) panel.show({ mode: 'create' });
        // Only on first visit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isFiltered = Boolean(filters.search || filters.status);

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();

        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;

        router.get(route('admin.users.index'), params, { preserveState: true, replace: true });
    };

    const data = panel.data;
    const employee = data && data.mode !== 'create' ? (users.data.find((u) => u.id === data.snapshot.id) ?? data.snapshot) : null;

    return (
        <AdminLayout title="User management">
            <Head title="User management" />

            <PageHeader
                title="User management"
                description="Employee accounts, their status and what they can access. Select an employee to see everything and act on it."
                actions={
                    <Can permission="users.create">
                        <Button onClick={() => panel.show({ mode: 'create' })}>
                            <Plus aria-hidden="true" />
                            Add employee
                        </Button>
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

                <FilterSelect id="status" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
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
                    <Th>
                        <span className="sr-only">Open</span>
                    </Th>
                </THead>
                <TBody>
                    {users.data.map((user) => (
                        <Tr key={user.id} onOpen={() => panel.show({ mode: 'view', snapshot: user })} className="group">
                            <Td className="max-w-[18rem]">
                                {/* The keyboard way into the row; a mouse click anywhere on the row does the same. */}
                                <button
                                    type="button"
                                    aria-label={`Open ${user.name}`}
                                    className="-mx-1 flex min-w-0 items-center gap-3 rounded-md px-1 py-0.5 text-left focus-visible:ring-2 focus-visible:ring-maroon-500/40"
                                >
                                    <Avatar
                                        name={user.name}
                                        photoUrl={user.photo_url}
                                        firstName={user.first_name}
                                        lastName={user.last_name}
                                        size="sm"
                                    />
                                    <span className="min-w-0">
                                        <span className="block truncate font-medium text-ink">{user.name}</span>
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
                            <Td align="right" className="w-10">
                                <ChevronRight
                                    className="ml-auto h-4 w-4 text-stone-300 transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-stone-500"
                                    aria-hidden="true"
                                />
                            </Td>
                        </Tr>
                    ))}

                    {users.data.length === 0 && (
                        <EmptyRow
                            colSpan={6}
                            icon={Users}
                            title={isFiltered ? 'No employees match these filters' : 'No employees yet'}
                            hint={isFiltered ? 'Try a different name, ID or status.' : 'Add an employee to create their account.'}
                        />
                    )}
                </TBody>
            </Table>

            <SidePanel open={panel.open} onClose={panel.close} size="lg" contentKey={panel.key}>
                {data?.mode === 'create' && <UserForm key={panel.key} options={formOptions} onSaved={panel.close} onCancel={panel.close} />}

                {data?.mode === 'view' && employee && (
                    <EmployeeDetails
                        key={panel.key}
                        employee={employee}
                        removalReasons={removalReasons}
                        modules={formOptions.modules}
                        onEdit={() => panel.replace({ mode: 'edit', snapshot: employee })}
                        onClose={panel.close}
                    />
                )}

                {data?.mode === 'edit' && employee && (
                    <UserForm
                        key={panel.key}
                        options={formOptions}
                        employee={employee}
                        onSaved={() => panel.replace({ mode: 'view', snapshot: employee })}
                        onCancel={() => panel.replace({ mode: 'view', snapshot: employee })}
                    />
                )}
            </SidePanel>
        </AdminLayout>
    );
}
