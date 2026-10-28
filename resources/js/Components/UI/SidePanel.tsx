import Button from '@/Components/UI/Button';
import { CloseButton, panelBackdropClass, panelMotion } from '@/Components/UI/overlay';
import { Dialog, DialogDescription, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { FormEvent, PropsWithChildren, ReactNode, useEffect, useRef } from 'react';

const WIDTHS = { md: 'sm:max-w-md', lg: 'sm:max-w-[36rem]', xl: 'sm:max-w-[40rem]' } as const;

interface SidePanelProps {
    open: boolean;
    /** Called on Escape, a click outside and the close button. */
    onClose: () => void;
    size?: keyof typeof WIDTHS;
    /** Runs once the panel has slid out completely. */
    afterLeave?: () => void;
    /**
     * Change it when the open panel switches content (e.g. details -> edit): focus then
     * moves into the new content (its `data-autofocus` element, or the panel), so
     * keyboard users are never left on a control that no longer exists.
     */
    contentKey?: number;
}

/**
 * The right-hand side panel (house style §5). Every record form (add or edit) and
 * every record's details open here, full height, so the list stays in view behind it.
 * Children are a PanelHeader, then either PanelBody + PanelFooter (details) or a
 * PanelForm (forms): the middle scrolls, the action bar never scrolls away. It stays
 * mounted while it slides out.
 */
export default function SidePanel({ open, onClose, size = 'lg', afterLeave, contentKey, children }: PropsWithChildren<SidePanelProps>) {
    const panelRef = useRef<HTMLDivElement>(null);
    const shownKey = useRef(contentKey);

    useEffect(() => {
        if (contentKey === shownKey.current) return;
        shownKey.current = contentKey;
        if (!open) return;

        const frame = requestAnimationFrame(() => {
            const target = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panelRef.current;
            target?.focus();
        });

        return () => cancelAnimationFrame(frame);
    }, [contentKey, open]);

    return (
        <Transition show={open} afterLeave={afterLeave}>
            <Dialog onClose={onClose} className="relative z-50">
                <TransitionChild>
                    <div className={panelBackdropClass} aria-hidden="true" />
                </TransitionChild>

                <div className="pointer-events-none fixed inset-y-0 right-0 flex w-full justify-end">
                    <TransitionChild>
                        <DialogPanel
                            ref={panelRef}
                            tabIndex={-1}
                            className={`pointer-events-auto relative flex h-full w-full flex-col border-l border-line bg-white shadow-panel outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${WIDTHS[size]} ${panelMotion}`}
                        >
                            {children}
                            <CloseButton onClick={onClose} />
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}

interface PanelHeaderProps {
    title: ReactNode;
    /** Small label above the title, e.g. "Edit employee". */
    eyebrow?: string;
    description?: ReactNode;
    /** Leading visual of the live summary, e.g. the person's avatar. */
    leading?: ReactNode;
    /** Badges or status under the title. */
    meta?: ReactNode;
}

/** The panel's live summary: what the panel is about, kept in view at the top. */
export function PanelHeader({ title, eyebrow, description, leading, meta }: PanelHeaderProps) {
    return (
        <div className="flex shrink-0 items-start gap-4 border-b border-line bg-paper px-6 py-5 pr-14">
            {leading}
            <div className="min-w-0 flex-1">
                {eyebrow && <p className="eyebrow mb-0.5">{eyebrow}</p>}
                <DialogTitle className="truncate text-base font-semibold text-ink">{title}</DialogTitle>
                {description && <DialogDescription className="mt-0.5 text-[13px] text-stone-500">{description}</DialogDescription>}
                {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
            </div>
        </div>
    );
}

/** The scrolling middle; sections inside are separated by a hairline. */
export function PanelBody({ children }: PropsWithChildren) {
    return <div className="min-h-0 flex-1 divide-y divide-line overflow-y-auto overscroll-contain">{children}</div>;
}

interface PanelSectionProps {
    title?: string;
    description?: ReactNode;
    /** Something small on the right of the heading. */
    aside?: ReactNode;
}

/** A titled group of fields or details inside a panel. */
export function PanelSection({ title, description, aside, children }: PropsWithChildren<PanelSectionProps>) {
    return (
        <section className="space-y-4 px-6 py-6">
            {(title || aside) && (
                <div className="flex items-end justify-between gap-3">
                    <div className="space-y-0.5">
                        {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
                        {description && <p className="text-[13px] text-stone-500">{description}</p>}
                    </div>
                    {aside}
                </div>
            )}
            {children}
        </section>
    );
}

/** The panel's action bar: right-aligned, primary last, stacked full width on phones. */
export function PanelFooter({ children, note }: PropsWithChildren<{ note?: ReactNode }>) {
    return (
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            {note && <div className="min-w-0 text-[13px] text-stone-500 sm:mr-auto">{note}</div>}
            {children}
        </div>
    );
}

interface PanelFormProps {
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    submitLabel: string;
    processing: boolean;
    /** Optional note on the left of the actions, e.g. upload progress. */
    note?: ReactNode;
    cancelLabel?: string;
}

/**
 * A record form inside a side panel: the fields scroll, the Cancel / submit bar
 * stays at the bottom. Put PanelSection children inside.
 */
export function PanelForm({ onSubmit, onCancel, submitLabel, processing, note, cancelLabel = 'Cancel', children }: PropsWithChildren<PanelFormProps>) {
    return (
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <PanelBody>{children}</PanelBody>
            <PanelFooter note={note}>
                <Button type="button" variant="secondary" onClick={onCancel} disabled={processing}>
                    {cancelLabel}
                </Button>
                <Button type="submit" loading={processing}>
                    {submitLabel}
                </Button>
            </PanelFooter>
        </form>
    );
}
