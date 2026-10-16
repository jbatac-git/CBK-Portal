import StatCard from '@/Components/Dashboard/StatCard';
import { buttonClass } from '@/Components/UI/Button';
import PageHeader from '@/Components/UI/PageHeader';
import { usePermission } from '@/Hooks/usePermission';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Plus } from 'lucide-react';

interface DashboardProps {
    stats: Record<string, number>;
}

interface StatMeta {
    label: string;
    /** Counts that mean someone has work to do. */
    actionable?: boolean;
    routeName?: string;
    params?: Record<string, string>;
    permission?: string;
}

// Backend sends raw counts keyed by stat name; the frontend owns the
// presentation — this keeps the Service free of UI concerns.
const statMeta: Record<string, StatMeta> = {
    pending_approval: { label: 'Pending approval', actionable: true, routeName: 'admin.users.index', params: { status: 'temporary' }, permission: 'users.view' },
    expiring_soon: { label: 'Expiring in 2 days', actionable: true, routeName: 'admin.users.index', params: { status: 'temporary' }, permission: 'users.view' },
    pending_removals: { label: 'Pending removals', actionable: true, routeName: 'admin.removal-requests.index', permission: 'users.deactivate' },
    active_users: { label: 'Active employees', routeName: 'admin.users.index', params: { status: 'active' }, permission: 'users.view' },
    published_materials: { label: 'Published materials', routeName: 'admin.learning-materials.index', permission: 'learning-materials.view' },
    active_price_lists: { label: 'Active price lists', routeName: 'admin.price-lists.index', permission: 'price-lists.view' },
};

function greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

export default function Dashboard({ stats }: DashboardProps) {
    const { user, can } = usePermission();

    const entries = Object.entries(stats).filter(([key]) => statMeta[key]);
    const tasks = entries.filter(([key, value]) => statMeta[key].actionable && value > 0);
    const today = new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

    const hrefFor = (meta: StatMeta) =>
        meta.routeName && (!meta.permission || can(meta.permission)) ? route(meta.routeName, meta.params ?? {}) : undefined;

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            <PageHeader
                eyebrow={today}
                title={`${greeting()}, ${user.first_name}`}
                actions={
                    can('users.create') && (
                        <Link href={route('admin.users.create')} className={buttonClass('primary')}>
                            <Plus aria-hidden="true" />
                            Add employee
                        </Link>
                    )
                }
            />

            <section aria-label="Overview" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-3">
                {entries.map(([key, value]) => {
                    const meta = statMeta[key];

                    return (
                        <StatCard
                            key={key}
                            label={meta.label}
                            value={value}
                            warning={meta.actionable && value > 0}
                            href={hrefFor(meta)}
                        />
                    );
                })}
            </section>

            <section className="mt-10" aria-labelledby="tasks-heading">
                <h2 id="tasks-heading" className="text-[15px] font-semibold text-ink">
                    To do
                </h2>

                {tasks.length === 0 ? (
                    <p className="mt-2 text-sm text-stone-500">You're all caught up.</p>
                ) : (
                    <ul className="mt-3 divide-y divide-line border-y border-line">
                        {tasks.map(([key, value]) => {
                            const meta = statMeta[key];
                            const href = hrefFor(meta);

                            return (
                                <li key={key}>
                                    {href ? (
                                        <Link href={href} className="group flex items-center justify-between gap-4 py-3.5 text-sm">
                                            <TaskText label={meta.label} value={value} />
                                            <ArrowRight
                                                className="h-4 w-4 text-stone-300 transition-colors group-hover:text-maroon-700"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                    ) : (
                                        <div className="py-3.5 text-sm">
                                            <TaskText label={meta.label} value={value} />
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </AdminLayout>
    );
}

function TaskText({ label, value }: { label: string; value: number }) {
    return (
        <span className="flex items-center gap-3">
            <span className="tabular inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gold-50 px-2 text-xs font-semibold text-gold-700 ring-1 ring-inset ring-gold-200">
                {value}
            </span>
            <span className="text-stone-700">{label}</span>
        </span>
    );
}
