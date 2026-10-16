import FieldShell from '@/Components/UI/FieldShell';
import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: ReactNode;
    optional?: boolean;
}

export default function Input({ label, error, hint, optional, id, className = '', ...props }: InputProps) {
    const inputId = id ?? props.name ?? label;

    return (
        <FieldShell id={inputId} label={label} error={error} hint={hint} optional={optional}>
            <input
                id={inputId}
                {...props}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className={`field ${className}`}
            />
        </FieldShell>
    );
}
