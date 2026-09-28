import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
}

export default function Select({ label, error, id, className = '', children, ...props }: SelectProps) {
    const selectId = id ?? props.name;

    return (
        <div>
            <label htmlFor={selectId} className="block text-sm font-medium text-stone-700">
                {label}
            </label>
            <select
                id={selectId}
                {...props}
                aria-invalid={error ? true : undefined}
                className={`mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-maroon focus:ring-maroon ${className}`}
            >
                {children}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}