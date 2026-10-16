import Button, { ButtonVariant } from '@/Components/UI/Button';
import { AlertTriangle } from 'lucide-react';
import { PropsWithChildren, useEffect, useRef } from 'react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel: string;
    variant?: ButtonVariant;
    processing?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    variant = 'primary',
    processing = false,
    onConfirm,
    onCancel,
    children,
}: PropsWithChildren<ConfirmDialogProps>) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;

        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-labelledby="confirm-dialog-title"
            onCancel={(e) => {
                e.preventDefault(); // let React state decide when to close
                if (!processing) onCancel();
            }}
            onClick={(e) => {
                // Clicking the backdrop (the dialog element itself, outside the panel) cancels.
                if (e.target === e.currentTarget && !processing) onCancel();
            }}
            className="w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-white p-0 shadow-overlay backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] open:animate-rise-in"
        >
            <div className="p-6">
                <div className="flex gap-4">
                    {variant === 'danger' && (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
                            <AlertTriangle className="h-[18px] w-[18px] text-red-700" aria-hidden="true" />
                        </span>
                    )}
                    <div className="min-w-0 flex-1">
                        <h2 id="confirm-dialog-title" className="text-base font-semibold text-ink">
                            {title}
                        </h2>
                        {description && <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{description}</p>}
                        {children && <div className="mt-4">{children}</div>}
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 rounded-b-xl border-t border-line bg-paper px-6 py-3.5">
                <Button variant="secondary" onClick={onCancel} disabled={processing}>
                    Cancel
                </Button>
                <Button variant={variant} onClick={onConfirm} loading={processing}>
                    {confirmLabel}
                </Button>
            </div>
        </dialog>
    );
}
