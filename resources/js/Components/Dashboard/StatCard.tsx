import { Link } from '@inertiajs/react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: number;
    Icon: LucideIcon;
    /** Highlights the card when the number needs someone's attention. */
    warning?: boolean;
    href?: string;
}

export default function StatCard({ label, value, Icon, warning = false, href }: StatCardProps) {
    const body = (
        <>
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] font-medium text-stone-600">
                    <Icon className={`h-4 w-4 ${warning ? 'text-gold-600' : 'text-stone-400'}`} aria-hidden="true" />
                    {label}
                </span>
                {href && (
                    <ArrowUpRight
                        className="h-4 w-4 text-stone-300 transition-colors group-hover:text-maroon-700"
                        aria-hidden="true"
                    />
                )}
            </div>
            <div className="mt-4 flex items-end gap-2">
                <span className="tabular font-display text-[34px] font-medium leading-none tracking-tight text-ink">{value}</span>
                {warning && (
                    <span className="mb-1 rounded bg-gold-50 px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-gold-700 ring-1 ring-inset ring-gold-200">
                        Needs action
                    </span>
                )}
            </div>
        </>
    );

    const className = `group relative block rounded-lg border bg-white p-5 shadow-hairline transition-[border-color,box-shadow] ${
        warning ? 'border-gold-300' : 'border-line'
    } ${href ? 'hover:border-stone-300 hover:shadow-raised' : ''}`;

    return href ? (
        <Link href={href} className={className}>
            {body}
        </Link>
    ) : (
        <div className={className}>{body}</div>
    );
}
