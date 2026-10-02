import StatCard from '@/Components/Dashboard/StatCard';
import { usePermission } from '@/Hooks/usePermission';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, BookOpen, Clock, FileText, LucideIcon, UserCheck, UserMinus, Users } from 'lucide-react';

interface DashboardProps {
    stats: Record<string, number>;
}

interface StatMeta {
    label: string;
    icon: LucideIcon;
    warning?: boolean;
}

// Backend sends raw counts keyed by stat name; the frontend owns the
// label/icon presentation — this keeps the Service free of UI concerns.
const statMeta: Record<string, StatMeta> = {
    active_users: { label: 'Active users', icon: Users },
    pending_approval: { label: 'Pending approval', icon: UserCheck, warning: true },
    expiring_soon: { label: 'Expiring in 2 days', icon: Clock, warning: true },
    pending_removals: { label: 'Pending removals', icon: UserMinus, warning: true },
    published_materials: { label: 'Published materials', icon: BookOpen },
    active_price_lists: { label: 'Active price lists', icon: FileText },
};

export default function Dashboard({ stats }: DashboardProps) {
    const { user } = usePermission();

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="rounded-xl border border-t-4 border-stone-200 border-t-gold bg-white p-6">
                <h2 className="text-lg font-medium text-maroon">Welcome, {user.first_name}</h2>
                <p className="mt-1 text-sm text-stone-600">You are signed in as {user.roles.join(', ')}.</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Object.entries(stats).map(([key, value]) => {
                    const meta = statMeta[key];
                    if (!meta) return null;

                    return (
                        <StatCard
                            key={key}
                            label={meta.label}
                            value={value}
                            Icon={meta.icon}
                            warning={meta.warning && value > 0}
                        />
                    );
                })}
            </div>

            {(stats.pending_approval ?? 0) > 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-gold bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <AlertTriangle className="h-4 w-4" />
                    {stats.pending_approval} temporary account(s) are waiting for approval.
                </div>
            )}
        </AdminLayout>
    );
}