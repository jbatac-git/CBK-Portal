import { EyeOff, Maximize2, Minimize2 } from 'lucide-react';

interface FullscreenButtonProps {
    isFullscreen: boolean;
    onToggle: () => void;
    /** "light" for dark toolbars (video), "dark" for light toolbars (documents). */
    tone?: 'dark' | 'light';
}

export function FullscreenButton({ isFullscreen, onToggle, tone = 'dark' }: FullscreenButtonProps) {
    const Icon = isFullscreen ? Minimize2 : Maximize2;
    const label = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onToggle}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-maroon-500/40 ${
                tone === 'light' ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-ink'
            }`}
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
    );
}

/** Opaque cover shown while the viewer is away from the window (see useContentProtection). */
export function ShieldOverlay({ visible }: { visible: boolean }) {
    if (!visible) return null;

    return (
        <div
            role="status"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-paper/95 px-6 text-center backdrop-blur-3xl"
        >
            <EyeOff className="h-5 w-5 text-stone-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-ink">Content hidden</p>
            <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-stone-500">Return to this window to continue.</p>
        </div>
    );
}
