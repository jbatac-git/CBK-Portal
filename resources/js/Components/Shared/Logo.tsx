import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

interface LogoProps {
    /** Rendered height/width in pixels. */
    size?: number;
    className?: string;
}

/**
 * The CBK Academy mark: image only, no wordmark. A logo uploaded in
 * Settings replaces the built-in mark.
 */
export default function Logo({ size = 32, className = '' }: LogoProps) {
    const { branding } = usePage<PageProps>().props;

    return (
        <img
            src={branding?.logo_url ?? '/images/cbk-academy-mark.svg'}
            alt="CBK Academy"
            width={size}
            height={size}
            className={`shrink-0 rounded-[22%] object-contain ${className}`}
            style={{ width: size, height: size }}
        />
    );
}
