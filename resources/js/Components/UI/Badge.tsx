import { PropsWithChildren } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

const tones: Record<BadgeTone, string> = {
    neutral: 'bg-stone-100 text-stone-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
};

export default function Badge({ tone = 'neutral', children }: PropsWithChildren<{ tone?: BadgeTone }>) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
            {children}
        </span>
    );
}