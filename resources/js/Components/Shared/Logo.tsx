import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

interface LogoProps {
    /** "light" for dark backgrounds (sidebar), "dark" for light backgrounds. */
    tone?: 'light' | 'dark';
    className?: string;
}

export default function Logo({ tone = 'light', className = '' }: LogoProps) {
    const { branding } = usePage<PageProps>().props;
    const light = tone === 'light';

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {branding?.logo_url ? (
                <img src={branding.logo_url} alt="CBK" className="h-8 w-8 rounded-md object-contain" />
            ) : (
                <span
                    className={`flex h-8 items-center rounded-md px-2 font-display text-[15px] font-semibold tracking-tight ${
                        light ? 'bg-white text-maroon-800' : 'bg-maroon-700 text-white'
                    }`}
                >
                    CBK
                </span>
            )}
            <span className={`text-[13px] font-medium tracking-wide ${light ? 'text-white/80' : 'text-stone-600'}`}>Portal</span>
        </div>
    );
}
