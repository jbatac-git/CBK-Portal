import { Link } from '@inertiajs/react';

interface StatCardProps {
    label: string;
    value: number;
    /** Marks the number as needing someone's attention. */
    warning?: boolean;
    href?: string;
}

/** One cell of the dashboard stat strip; the parent draws the grid lines. */
export default function StatCard({ label, value, warning = false, href }: StatCardProps) {
    const body = (
        <>
            <span className="flex items-center gap-2 text-[13px] text-stone-500">
                {label}
                {warning && <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-label="Needs attention" />}
            </span>
            <span className="tabular mt-3 block font-display text-[32px] font-medium leading-none tracking-tight text-ink">
                {value}
            </span>
        </>
    );

    const className = 'block bg-white px-6 py-5 transition-colors';

    return href ? (
        <Link href={href} className={`${className} hover:bg-paper`}>
            {body}
        </Link>
    ) : (
        <div className={className}>{body}</div>
    );
}
