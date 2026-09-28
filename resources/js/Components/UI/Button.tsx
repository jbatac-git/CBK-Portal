import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
}

const variants: Record<Variant, string> = {
    primary: 'bg-maroon text-white hover:bg-maroon-dark',
    secondary: 'border border-maroon text-maroon hover:bg-maroon/5',
    danger: 'bg-red-600 text-white hover:bg-red-700',
};

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50 ${variants[variant]} ${className}`}
        />
    );
}