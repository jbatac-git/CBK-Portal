import { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

const variants: Record<ButtonVariant, string> = {
    primary: 'bg-maroon text-white hover:bg-maroon-dark',
    secondary: 'border border-maroon text-maroon hover:bg-maroon/5',
    danger: 'bg-red-600 text-white hover:bg-red-700',
};

/** Use on <Link> when it should look like a button. */
export function buttonClass(variant: ButtonVariant = 'primary', extra = ''): string {
    return `inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50 ${variants[variant]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
    return <button {...props} className={buttonClass(variant, className)} />;
}