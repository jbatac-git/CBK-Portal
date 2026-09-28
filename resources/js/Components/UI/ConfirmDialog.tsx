import Button, { ButtonVariant } from '@/Components/UI/Button';
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
            onCancel={(e) => {
                e.preventDefault(); // let React state decide when to close
                onCancel();
            }}
            className="w-full max-w-md rounded-xl p-0 backdrop:bg-black/40"
        >
            <div className="space-y-4 p-6">
                <h2 className="text-lg font-medium text-maroon">{title}</h2>
                {description && <p className="text-sm text-stone-600">{description}</p>}
                {children}
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={onCancel} disabled={processing}>
                        Cancel
                    </Button>
                    <Button variant={variant} onClick={onConfirm} disabled={processing}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </dialog>
    );
}