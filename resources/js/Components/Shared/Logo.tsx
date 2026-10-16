import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

interface LogoProps {
    /** Height/width of the mark in pixels. */
    size?: number;
    /** Show the "CBK Academy" wordmark beside the mark. */
    wordmark?: boolean;
    /** "dark" text for light backgrounds, "light" text for dark backgrounds. */
    tone?: 'dark' | 'light';
    className?: string;
}

/**
 * The CBK Academy mark with an optional wordmark. A logo uploaded in
 * Settings replaces the built-in mark; the wordmark stays.
 */
export default function Logo({ size = 32, wordmark = true, tone = 'dark', className = '' }: LogoProps) {
    const { branding } = usePage<PageProps>().props;
    const light = tone === 'light';

    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <img
                src={branding?.logo_url ?? '/images/cbk-academy-mark.svg'}
                alt={wordmark ? '' : 'CBK Academy'}
                width={size}
                height={size}
                className="shrink-0 rounded-[22%] object-contain"
                style={{ width: size, height: size }}
            />
            {wordmark && (
                <span
                    className={`whitespace-nowrap font-display leading-none tracking-[-0.01em] ${light ? 'text-white' : 'text-ink'}`}
                    style={{ fontSize: Math.round(size * 0.56) }}
                >
                    <span className="font-semibold">CBK</span>{' '}
                    <span className={`font-normal ${light ? 'text-gold-300' : 'text-maroon-700'}`}>Academy</span>
                </span>
            )}
        </span>
    );
}
