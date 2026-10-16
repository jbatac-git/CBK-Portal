import { Search } from 'lucide-react';
import { FormEventHandler, InputHTMLAttributes, PropsWithChildren, ReactNode, SelectHTMLAttributes } from 'react';

interface ToolbarProps {
    onSubmit: FormEventHandler;
    /** Right-aligned content such as primary actions. */
    actions?: ReactNode;
}

/** Filter row above a table: search + selects on the left, actions on the right. */
export default function Toolbar({ onSubmit, actions, children }: PropsWithChildren<ToolbarProps>) {
    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <form onSubmit={onSubmit} className="flex flex-1 flex-wrap items-center gap-2" role="search">
                {children}
            </form>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export function SearchInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className={`relative w-full sm:w-64 ${className}`}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            <input type="search" aria-label={props.placeholder} {...props} className="field h-9 py-0 pl-9" />
        </div>
    );
}

export function FilterSelect({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select {...props} className={`field h-9 w-auto py-0 pr-9 ${className}`}>
            {children}
        </select>
    );
}
