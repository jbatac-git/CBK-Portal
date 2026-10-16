import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Toast {
    id: number;
    tone: 'success' | 'error';
    message: string;
}

const AUTO_DISMISS_MS = 5000;

/**
 * Shows session flash messages as toasts in the corner. Each new flash
 * (even the same text twice) becomes a new toast; success toasts dismiss
 * themselves, errors stay until closed so they are not missed.
 */
export default function FlashMessage() {
    const page = usePage<PageProps>();
    const { flash } = page.props;
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const next: Toast[] = [];
        if (flash?.success) next.push({ id: Date.now(), tone: 'success', message: flash.success });
        if (flash?.error) next.push({ id: Date.now() + 1, tone: 'error', message: flash.error });
        if (next.length) setToasts((current) => [...current, ...next].slice(-3));
        // Re-run on every visit, not only when the text changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page.url, flash?.success, flash?.error]);

    useEffect(() => {
        const timers = toasts
            .filter((toast) => toast.tone === 'success')
            .map((toast) => setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS));

        return () => timers.forEach(clearTimeout);
    }, [toasts]);

    const dismiss = (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id));

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-4 top-16 z-[80] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:items-end"
        >
            {toasts.map((toast) => {
                const Icon = toast.tone === 'success' ? CircleCheck : CircleAlert;

                return (
                    <div
                        key={toast.id}
                        role={toast.tone === 'error' ? 'alert' : 'status'}
                        className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-lg border border-white/10 bg-ink py-3 pl-3.5 pr-2 text-sm text-white shadow-overlay"
                    >
                        <Icon
                            className={`mt-px h-[18px] w-[18px] shrink-0 ${toast.tone === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
                            aria-hidden="true"
                        />
                        <p className="flex-1 leading-snug text-white/90">{toast.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            className="rounded p-0.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                            aria-label="Dismiss"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
