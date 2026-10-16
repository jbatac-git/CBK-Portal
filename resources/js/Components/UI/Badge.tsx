import { PropsWithChildren } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand';

const tones: Record<BadgeTone, { pill: string; dot: string }> = {
    neutral: { pill: 'bg-stone-100 text-stone-700 ring-stone-200', dot: 'bg-stone-400' },
    success: { pill: 'bg-emerald-50 text-emerald-800 ring-emerald-200/70', dot: 'bg-emerald-500' },
    warning: { pill: 'bg-gold-50 text-gold-700 ring-gold-200', dot: 'bg-gold-500' },
    danger: { pill: 'bg-red-50 text-red-800 ring-red-200/70', dot: 'bg-red-500' },
    brand: { pill: 'bg-maroon-50 text-maroon-800 ring-maroon-200/70', dot: 'bg-maroon-600' },
};

export default function Badge({ tone = 'neutral', children }: PropsWithChildren<{ tone?: BadgeTone }>) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone].pill}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${tones[tone].dot}`} aria-hidden="true" />
            {children}
        </span>
    );
}
