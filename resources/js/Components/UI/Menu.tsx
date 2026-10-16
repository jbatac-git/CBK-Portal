import { Link } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface MenuItem {
    label: string;
    onSelect?: () => void;
    href?: string;
    danger?: boolean;
    /** Draws a divider above this item. */
    separated?: boolean;
}

interface MenuProps {
    items: MenuItem[];
    /** Accessible name for the trigger, e.g. "Actions for Juan Cruz". */
    label: string;
}

/**
 * "More actions" dropdown. The panel is portalled to <body> with fixed
 * positioning so it is never clipped by a scrolling table.
 */
export default function Menu({ items, label }: MenuProps) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!open || !triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const panelHeight = panelRef.current?.offsetHeight ?? 0;
        const fitsBelow = rect.bottom + 6 + panelHeight < window.innerHeight;

        setPosition({
            top: fitsBelow ? rect.bottom + 6 : rect.top - 6 - panelHeight,
            right: window.innerWidth - rect.right,
        });
    }, [open]);

    useEffect(() => {
        if (!open) return;

        panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

        const close = () => setOpen(false);
        const onPointer = (e: PointerEvent) => {
            const target = e.target as Node;
            if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
        };

        document.addEventListener('pointerdown', onPointer);
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);

        return () => {
            document.removeEventListener('pointerdown', onPointer);
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
        };
    }, [open]);

    const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const options = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
        const index = options.indexOf(document.activeElement as HTMLElement);

        if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            options[(index + 1) % options.length]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            options[(index - 1 + options.length) % options.length]?.focus();
        } else if (e.key === 'Tab') {
            setOpen(false);
        }
    };

    // Keep the column aligned when a row has nothing extra to offer.
    if (items.length === 0) return <span className="inline-block h-8 w-8" aria-hidden="true" />;

    const itemClass = (danger?: boolean) =>
        `flex w-full items-center rounded px-2.5 py-1.5 text-left text-[13px] outline-none transition-colors ${
            danger ? 'text-red-700 hover:bg-red-50 focus:bg-red-50' : 'text-stone-700 hover:bg-stone-100 focus:bg-stone-100'
        }`;

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-ink ${
                    open ? 'bg-stone-100 text-ink' : ''
                }`}
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {open &&
                createPortal(
                    <div
                        ref={panelRef}
                        role="menu"
                        aria-label={label}
                        onKeyDown={onPanelKeyDown}
                        style={{ top: position?.top ?? -9999, right: position?.right ?? 0 }}
                        className="fixed z-50 min-w-[200px] animate-fade-in rounded-lg border border-line bg-white p-1 shadow-raised"
                    >
                        {items.map((item) => (
                            <div key={item.label}>
                                {item.separated && <div className="my-1 h-px bg-line" role="separator" />}
                                {item.href ? (
                                    <Link href={item.href} role="menuitem" className={itemClass(item.danger)} onClick={() => setOpen(false)}>
                                        {item.label}
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className={itemClass(item.danger)}
                                        onClick={() => {
                                            setOpen(false);
                                            item.onSelect?.();
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>,
                    document.body,
                )}
        </>
    );
}
