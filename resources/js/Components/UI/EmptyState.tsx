import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: ReactNode;
    action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-line bg-white/60 px-6 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper">
                <Icon className="h-5 w-5 text-stone-400" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-medium text-ink">{title}</p>
            {description && <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-stone-500">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
