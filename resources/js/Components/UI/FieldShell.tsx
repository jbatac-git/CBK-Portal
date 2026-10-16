import { PropsWithChildren, ReactNode } from 'react';

export interface FieldShellProps {
    id: string;
    label: ReactNode;
    error?: string;
    hint?: ReactNode;
    /** Marks the label "Optional" instead of relying on an asterisk for required fields. */
    optional?: boolean;
}

/** Label, hint and error around any form control, so every field lines up the same way. */
export default function FieldShell({ id, label, error, hint, optional, children }: PropsWithChildren<FieldShellProps>) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={id} className="text-[13px] font-medium text-stone-800">
                    {label}
                </label>
                {optional && <span className="text-2xs text-stone-400">Optional</span>}
            </div>
            {children}
            {error ? (
                <p id={`${id}-error`} className="text-[13px] text-red-700">
                    {error}
                </p>
            ) : (
                hint && <p className="text-[13px] text-stone-500">{hint}</p>
            )}
        </div>
    );
}
