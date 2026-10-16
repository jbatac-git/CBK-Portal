import { LoaderCircle } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const variants: Record<ButtonVariant, string> = {
    primary:
        'bg-maroon-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(36,6,10,0.25)] hover:bg-maroon-800 active:bg-maroon-900',
    secondary: 'border border-line bg-white text-ink shadow-hairline hover:border-stone-300 hover:bg-stone-50',
    ghost: 'text-stone-600 hover:bg-stone-100 hover:text-ink',
    danger: 'bg-red-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-red-800',
};

const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 gap-1.5 px-3 text-[13px]',
    md: 'h-9 gap-2 px-3.5 text-sm',
};

/** Use on <Link> when it should look like a button. */
export function buttonClass(variant: ButtonVariant = 'primary', extra = '', size: ButtonSize = 'md'): string {
    return `inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-maroon-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4 ${sizes[size]} ${variants[variant]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Shows a spinner and disables the button while a request is in flight. */
    loading?: boolean;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className = '',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={buttonClass(variant, className, size)}
        >
            {loading && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            {children}
        </button>
    );
}
