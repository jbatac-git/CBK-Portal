import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { CircleCheck, CircleX, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Toast {
    id: number;
    tone: 'success' | 'error';
    message: string;
}

const AUTO_DISMISS_MS = 5000;

const TONES = {
    success: { icon: CircleCheck, iconClass: 'text-emerald-600', accent: 'border-l-emerald-600' },
    error: { icon: CircleX, iconClass: 'text-red-600', accent: 'border-l-red-600' },
} as const;

interface FlashMessageProps {
    /** Lifts the toasts above a phone tab bar at the bottom of the screen. */
    aboveTabBar?: boolean;
}

/**
 * Session flash messages as toasts (house style §7): a white card with a hairline
 * border and the raised shadow; the status shows as an icon and a 3 px accent on
 * the left, never a tinted box. Bottom right on desktop, full width at the bottom
 * on phones. Success toasts dismiss themselves; errors stay until closed.
 */
export default function FlashMessage({ aboveTabBar = false }: FlashMessageProps) {
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
            className={`pointer-events-none fixed inset-x-4 z-[80] flex flex-col gap-2.5 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96 ${
                aboveTabBar ? 'bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6' : 'bottom-4'
            }`}
        >
            {toasts.map((toast) => {
                const tone = TONES[toast.tone];
                const Icon = tone.icon;

                return (
                    <div
                        key={toast.id}
                        role={toast.tone === 'error' ? 'alert' : 'status'}
                        className={`pointer-events-auto relative flex w-full animate-toast-in items-start gap-3 rounded-lg border border-l-[3px] border-line bg-white py-3 pl-3.5 pr-11 text-ink shadow-raised motion-reduce:animate-none ${tone.accent}`}
                    >
                        <Icon className={`mt-px h-[18px] w-[18px] shrink-0 ${tone.iconClass}`} aria-hidden="true" />
                        <p className="min-w-0 flex-1 text-sm leading-5">{toast.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-md text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-maroon-500/40"
                            aria-label="Dismiss"
                        >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
