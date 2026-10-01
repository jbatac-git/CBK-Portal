import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

export default function Logo({ className = '' }: { className?: string }) {
    const { branding } = usePage<PageProps & { branding: { logo_url: string | null } }>().props;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {branding.logo_url ? (
                <img src={branding.logo_url} alt="CBK" className="h-8 w-8 rounded object-contain" />
            ) : (
                <span className="rounded-md bg-white px-2 py-0.5 text-lg font-semibold tracking-tight text-maroon">
                    CBK
                </span>
            )}
            <span className="text-sm text-white/90">Portal</span>
        </div>
    );
}