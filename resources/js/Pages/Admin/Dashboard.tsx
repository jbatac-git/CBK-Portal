import StatCard from '@/Components/Dashboard/StatCard';
import { buttonClass } from '@/Components/UI/Button';
import PageHeader from '@/Components/UI/PageHeader';
import { usePermission } from '@/Hooks/usePermission';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, Clock, FileText, LucideIcon, UserCheck, UserMinus, Users } from 'lucide-react';

interface DashboardProps {
    stats: Record<string, number>;
}

interface StatMeta {
    label: string;
    icon: LucideIcon;
    /** Counts that mean someone has work to do. */
    actionable?: boolean;
    routeName?: string;
    permission?: string;
}

// Backend sends raw counts keyed by stat name; the frontend owns the
// label/icon presentation — this keeps the Service free of UI concerns.
const statMeta: Record<string, StatMeta> = {
    pending_approval: { label: 'Pending approval', icon: UserCheck, actionable: true, routeName: 'admin.users.index', permission: 'users.view' },
    expiring_soon: { label: 'Expiring in 2 days', icon: Clock, actionable: true, routeName: 'admin.users.index', permission: 'users.view' },
    pending_removals: { label: 'Pending removals', icon: UserMinus, actionable: true, routeName: 'admin.removal-requests.index', permission: 'users.deactivate' },
    active_users: { label: 'Active users', icon: Users, routeName: 'admin.users.index', permission: 'users.view' },
    published_materials: { label: 'Published materials', icon: BookOpen, routeName: 'admin.learning-materials.index', permission: 'learning-materials.view' },
    active_price_lists: { label: 'Active price lists', icon: FileText, routeName: 'admin.price-lists.index', permission: 'price-lists.view' },
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
    const needsAction = entries.filter(([key, value]) => statMeta[key].actionable && value > 0);
    const today = new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            <PageHeader
                eyebrow={today}
                title={`${greeting()}, ${user.first_name}.`}
                description={
                    needsAction.length > 0
                        ? `${needsAction.length} ${needsAction.length === 1 ? 'item needs' : 'items need'} your attention today.`
                        : 'Everything is up to date. Nothing needs your attention right now.'
                }
                actions={
                    can('users.create') && (
                        <Link href={route('admin.users.create')} className={buttonClass('primary')}>
                            Add employee
                        </Link>
                    )
                }
            />

            <section aria-labelledby="overview-heading">
                <h2 id="overview-heading" className="eyebrow mb-3">
                    Overview
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {entries.map(([key, value], index) => {
                        const meta = statMeta[key];
                        const href = meta.routeName && (!meta.permission || can(meta.permission)) ? route(meta.routeName) : undefined;

                        return (
                            <div key={key} className="animate-rise-in" style={{ animationDelay: `${index * 40}ms` }}>
                                <StatCard
                                    label={meta.label}
                                    value={value}
                                    Icon={meta.icon}
                                    warning={meta.actionable && value > 0}
                                    href={href}
                                />
                            </div>
                        );
                    })}
                </div>
            </section>

            {(stats.pending_approval ?? 0) > 0 && can('users.view') && (
                <section className="mt-8 flex flex-col gap-4 rounded-lg border border-line bg-white p-5 shadow-hairline sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-50 ring-1 ring-gold-200">
                            <UserCheck className="h-[18px] w-[18px] text-gold-700" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-ink">
                                {stats.pending_approval} temporary {stats.pending_approval === 1 ? 'account is' : 'accounts are'} waiting for approval
                            </p>
                            <p className="mt-0.5 text-[13px] text-stone-500">
                                Temporary access ends automatically after 7 days. Approve or decline before then.
                            </p>
                        </div>
                    </div>
                    <Link href={route('admin.users.index', { status: 'temporary' })} className={buttonClass('secondary')}>
                        Review accounts
                        <ArrowRight aria-hidden="true" />
                    </Link>
                </section>
            )}
        </AdminLayout>
    );
}
