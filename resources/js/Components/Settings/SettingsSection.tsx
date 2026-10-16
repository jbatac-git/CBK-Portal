import { PropsWithChildren, ReactNode } from 'react';

/** Vertical stack of settings rows separated by hairlines. */
export function SettingsSections({ children }: PropsWithChildren) {
    return <div className="max-w-5xl divide-y divide-line">{children}</div>;
}

interface SettingsSectionProps {
    title: string;
    description?: ReactNode;
}

/** One settings row: a short explanation on the left, the controls (usually a Card) on the right. */
export default function SettingsSection({ title, description, children }: PropsWithChildren<SettingsSectionProps>) {
    return (
        <section className="flex flex-col gap-4 py-8 first:pt-0 last:pb-0 lg:flex-row lg:gap-10">
            <div className="lg:w-72 lg:shrink-0">
                <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
                {description && <p className="mt-1 text-[13px] leading-relaxed text-stone-500">{description}</p>}
            </div>
            <div className="min-w-0 flex-1">{children}</div>
        </section>
    );
}
