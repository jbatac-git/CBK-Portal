import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
    const inputId = id ?? props.name;

    return (
        <div>
            <label htmlFor={inputId} className="block text-sm font-medium text-stone-700">
                {label}
            </label>
            <input
                id={inputId}
                {...props}
                aria-invalid={error ? true : undefined}
                className={`mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-maroon focus:ring-maroon ${className}`}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}