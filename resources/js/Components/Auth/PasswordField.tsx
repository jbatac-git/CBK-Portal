import FieldShell from '@/Components/UI/FieldShell';
import { Eye, EyeOff } from 'lucide-react';
import { InputHTMLAttributes, ReactNode, useState } from 'react';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    error?: string;
    hint?: ReactNode;
}

/** Password input with a show/hide toggle, laid out like the other UI fields. */
export default function PasswordField({ label, error, hint, id, className = '', ...props }: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? props.name ?? label;

    return (
        <FieldShell id={inputId} label={label} error={error} hint={hint}>
            <div className="relative">
                <input
                    id={inputId}
                    {...props}
                    type={visible ? 'text' : 'password'}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    className={`field pr-10 ${className}`}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    aria-pressed={visible}
                    aria-controls={inputId}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-stone-400 transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-maroon-500/40"
                >
                    {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
            </div>
        </FieldShell>
    );
}
