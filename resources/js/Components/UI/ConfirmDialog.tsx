import Button, { ButtonVariant } from '@/Components/UI/Button';
import Modal, { ModalBody, ModalDescription, ModalFooter, ModalTitle } from '@/Components/UI/Modal';
import { AlertTriangle } from 'lucide-react';
import { PropsWithChildren } from 'react';

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

/**
 * Asks before an action takes effect. Focus starts on Cancel, so pressing Enter
 * never confirms by accident; it cannot be dismissed while the request runs.
 */
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
    const cancel = () => {
        if (!processing) onCancel();
    };

    return (
        <Modal open={open} onClose={cancel} showClose={false}>
            <ModalBody>
                <div className="flex gap-4">
                    {variant === 'danger' && (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
                            <AlertTriangle className="h-[18px] w-[18px] text-red-700" aria-hidden="true" />
                        </span>
                    )}
                    <div className="min-w-0 flex-1">
                        <ModalTitle>{title}</ModalTitle>
                        {description && <ModalDescription>{description}</ModalDescription>}
                        {children && <div className="mt-4">{children}</div>}
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="secondary" onClick={cancel} disabled={processing} data-autofocus>
                    Cancel
                </Button>
                <Button variant={variant} onClick={onConfirm} loading={processing}>
                    {confirmLabel}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
