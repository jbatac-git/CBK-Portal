import { PropsWithChildren, ReactNode } from 'react';

interface AuthHeaderProps {
    title: string;
    description?: ReactNode;
    eyebrow?: string;
}

/** Heading block used at the top of every sign-in flow screen. */
export default function AuthHeader({ title, description, eyebrow }: AuthHeaderProps) {
    return (
        <div className="mb-8">
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            <h1 className="font-display text-[30px] font-medium leading-tight tracking-[-0.01em] text-ink">{title}</h1>
            {description && <p className="mt-2 text-sm leading-relaxed text-stone-600">{description}</p>}
        </div>
    );
}

/** Quiet confirmation shown above a form, e.g. "We emailed you a reset link." */
export function AuthNotice({ children }: PropsWithChildren) {
    return (
        <div role="status" className="mb-6 rounded-md border border-emerald-200/80 bg-emerald-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-emerald-800">
            {children}
        </div>
    );
}
