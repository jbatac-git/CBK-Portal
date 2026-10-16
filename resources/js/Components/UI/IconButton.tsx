import { Link } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
    icon: LucideIcon;
    /** Accessible name, also shown as the tooltip. */
    label: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
}

const base =
    'group/icon relative inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-ink disabled:pointer-events-none disabled:opacity-40';

/**
 * Square icon-only action with a tooltip. The tooltip opens to the left so
 * it is never clipped by a table's scroll container.
 */
export default function IconButton({ icon: Icon, label, href, onClick, disabled }: IconButtonProps) {
    const content = (
        <>
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span
                role="tooltip"
                className="pointer-events-none absolute right-full top-1/2 z-10 mr-1.5 -translate-y-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-xs font-medium text-white opacity-0 shadow-raised transition-opacity duration-150 group-hover/icon:opacity-100 group-focus-visible/icon:opacity-100"
            >
                {label}
            </span>
        </>
    );

    return href ? (
        <Link href={href} aria-label={label} className={base}>
            {content}
        </Link>
    ) : (
        <button type="button" aria-label={label} onClick={onClick} disabled={disabled} className={base}>
            {content}
        </button>
    );
}
