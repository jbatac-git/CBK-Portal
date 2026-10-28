import { backdropClass, CloseButton, dialogMotion } from '@/Components/UI/overlay';
import { Dialog, DialogDescription, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { PropsWithChildren, ReactNode } from 'react';

const WIDTHS = { sm: 'max-w-md', md: 'max-w-lg' } as const;

interface ModalProps {
    open: boolean;
    /** Called on Escape, a click outside and the close button. Ignore it while busy. */
    onClose: () => void;
    size?: keyof typeof WIDTHS;
    /** Hides the corner close button, e.g. for confirmations that have their own Cancel. */
    showClose?: boolean;
    /** Runs once the dialog has finished appearing (e.g. to measure its content). */
    afterEnter?: () => void;
    /** Runs once the dialog has fully disappeared. */
    afterLeave?: () => void;
}

/**
 * The centered dialog for confirmations and focused tasks (house style §5). Record
 * forms use the side panel instead. Focus moves to the element marked `data-autofocus`
 * (or the first focusable one) and returns to the trigger on close; Escape closes the
 * innermost layer first, so a confirmation over a side panel closes on its own.
 */
export default function Modal({ open, onClose, size = 'sm', showClose = true, afterEnter, afterLeave, children }: PropsWithChildren<ModalProps>) {
    return (
        <Transition show={open} appear afterLeave={afterLeave}>
            <Dialog onClose={onClose} className="relative z-50">
                <TransitionChild>
                    <div className={backdropClass} aria-hidden="true" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild afterEnter={afterEnter}>
                            <DialogPanel className={`relative w-full ${WIDTHS[size]} rounded-[14px] border border-line bg-white shadow-overlay ${dialogMotion}`}>
                                {children}
                                {showClose && <CloseButton onClick={onClose} />}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export function ModalBody({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
    return <div className={`px-6 pb-5 pt-6 ${className}`}>{children}</div>;
}

export function ModalTitle({ children }: PropsWithChildren) {
    return <DialogTitle className="pr-8 text-base font-semibold text-ink">{children}</DialogTitle>;
}

export function ModalDescription({ children }: { children: ReactNode }) {
    return <DialogDescription className="mt-1.5 text-sm leading-relaxed text-stone-600">{children}</DialogDescription>;
}

/** Actions, right-aligned with the primary last; stacked full width on phones. */
export function ModalFooter({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-col-reverse gap-2 rounded-b-[14px] border-t border-line bg-paper px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            {children}
        </div>
    );
}
