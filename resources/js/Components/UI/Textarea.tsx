import FieldShell from '@/Components/UI/FieldShell';
import { ReactNode, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    hint?: ReactNode;
    optional?: boolean;
}

export default function Textarea({ label, error, hint, optional, id, className = '', rows = 3, ...props }: TextareaProps) {
    const textareaId = id ?? props.name ?? label;

    return (
        <FieldShell id={textareaId} label={label} error={error} hint={hint} optional={optional}>
            <textarea
                id={textareaId}
                rows={rows}
                {...props}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${textareaId}-error` : undefined}
                className={`field resize-y leading-relaxed ${className}`}
            />
        </FieldShell>
    );
}
