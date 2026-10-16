import { HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

export default function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className={`rounded-lg border border-line bg-white shadow-hairline ${className}`}>
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
}

export function CardHeader({ title, description, actions }: CardHeaderProps) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
                {description && <p className="mt-0.5 text-[13px] text-stone-500">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}

export function CardBody({ className = '', children }: PropsWithChildren<{ className?: string }>) {
    return <div className={`px-5 py-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children }: PropsWithChildren) {
    return (
        <div className="flex items-center justify-end gap-2 rounded-b-lg border-t border-line bg-paper px-5 py-3">
            {children}
        </div>
    );
}
