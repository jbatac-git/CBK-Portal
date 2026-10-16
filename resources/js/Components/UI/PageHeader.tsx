import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    /** Small label above the title, e.g. the module name. */
    eyebrow?: ReactNode;
    actions?: ReactNode;
    /** Renders a "back" link above the title for create/edit screens. */
    back?: { href: string; label: string };
}

export default function PageHeader({ title, description, eyebrow, actions, back }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="min-w-0 max-w-2xl">
                {back && (
                    <Link
                        href={back.href}
                        className="mb-3 inline-flex items-center gap-1 text-[13px] font-medium text-stone-500 transition-colors hover:text-ink"
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        {back.label}
                    </Link>
                )}
                {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
                <h1 className="font-display text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink">{title}</h1>
                {description && <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
