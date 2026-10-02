import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: number;
    Icon: LucideIcon;
    warning?: boolean;
}

export default function StatCard({ label, value, Icon, warning = false }: StatCardProps) {
    return (
        <div className={`rounded-xl border bg-white p-4 ${warning ? 'border-gold' : 'border-stone-200'}`}>
            <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">{label}</span>
                <Icon className={`h-4 w-4 ${warning ? 'text-gold' : 'text-maroon'}`} />
            </div>
            <div className="mt-1 text-2xl font-semibold text-stone-900">{value}</div>
        </div>
    );
}