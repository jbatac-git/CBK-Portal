import { LucideIcon } from 'lucide-react';
import { HTMLAttributes, PropsWithChildren, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

/** Card-wrapped, horizontally scrollable table. */
export default function Table({ children, footer }: PropsWithChildren<{ footer?: ReactNode }>) {
    return (
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-hairline">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">{children}</table>
            </div>
            {footer && <div className="border-t border-line bg-paper px-4 py-3">{footer}</div>}
        </div>
    );
}

export function THead({ children }: PropsWithChildren) {
    return (
        <thead className="border-b border-line bg-paper">
            <tr>{children}</tr>
        </thead>
    );
}

export function Th({ className = '', align = 'left', children, ...props }: ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' }) {
    return (
        <th
            scope="col"
            {...props}
            className={`whitespace-nowrap px-4 py-2.5 text-2xs font-semibold uppercase tracking-[0.08em] text-stone-500 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}
        >
            {children}
        </th>
    );
}

export function TBody({ children }: PropsWithChildren) {
    return <tbody className="divide-y divide-line/80">{children}</tbody>;
}

export function Tr({ className = '', children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr {...props} className={`transition-colors hover:bg-paper/70 ${className}`}>
            {children}
        </tr>
    );
}

export function Td({ className = '', align = 'left', children, ...props }: TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' }) {
    return (
        <td {...props} className={`px-4 py-3 align-middle text-stone-700 ${align === 'right' ? 'text-right' : ''} ${className}`}>
            {children}
        </td>
    );
}

interface EmptyRowProps {
    colSpan: number;
    icon: LucideIcon;
    title: string;
    hint?: ReactNode;
}

export function EmptyRow({ colSpan, icon: Icon, title, hint }: EmptyRowProps) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-4 py-14">
                <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper">
                        <Icon className="h-[18px] w-[18px] text-stone-400" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-ink">{title}</p>
                    {hint && <p className="mt-1 text-[13px] text-stone-500">{hint}</p>}
                </div>
            </td>
        </tr>
    );
}

/** Inline row action link/button styling, e.g. "Edit" / "Archive" in the last column. */
export const rowActionClass =
    'inline-flex h-7 items-center rounded px-2 text-[13px] font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink';
export const rowDangerActionClass =
    'inline-flex h-7 items-center rounded px-2 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-50';
