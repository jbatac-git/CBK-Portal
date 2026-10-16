import FieldShell from '@/Components/UI/FieldShell';
import { ReactNode, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    hint?: ReactNode;
    optional?: boolean;
}

export default function Select({ label, error, hint, optional, id, className = '', children, ...props }: SelectProps) {
    const selectId = id ?? props.name ?? label;

    return (
        <FieldShell id={selectId} label={label} error={error} hint={hint} optional={optional}>
            <select
                id={selectId}
                {...props}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${selectId}-error` : undefined}
                className={`field pr-9 ${className}`}
            >
                {children}
            </select>
        </FieldShell>
    );
}
