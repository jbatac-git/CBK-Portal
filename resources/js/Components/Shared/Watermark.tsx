import { useMemo } from 'react';

export interface WatermarkViewer {
    name: string;
    username: string;
}

interface WatermarkProps {
    viewer: WatermarkViewer;
    /** "dark" text for light surfaces (documents), "light" text for dark surfaces (video). */
    tone?: 'dark' | 'light';
}

const dateFormat = new Intl.DateTimeFormat('en-PH', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * Tiled, diagonal "full name · username · date" overlay, so any screenshot
 * or phone photo of the material can be traced back to the viewer and day.
 * Sized generously so it still covers the screen in fullscreen.
 */
export default function Watermark({ viewer, tone = 'dark' }: WatermarkProps) {
    const line = useMemo(() => {
        const stamp = `${viewer.name} · @${viewer.username} · ${dateFormat.format(new Date())}`;
        return Array.from({ length: 5 }, () => stamp).join('      ');
    }, [viewer.name, viewer.username]);

    const rows = Array.from({ length: 16 });

    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 select-none overflow-hidden">
            <div
                className={`absolute -left-1/2 top-1/2 w-[200%] -translate-y-1/2 -rotate-[24deg] space-y-16 font-mono text-[11px] font-medium tracking-[0.08em] ${
                    tone === 'light' ? 'text-white/[0.09]' : 'text-ink/[0.07]'
                }`}
            >
                {rows.map((_, i) => (
                    <div key={i} className={`whitespace-pre ${i % 2 ? 'pl-40' : ''}`}>
                        {line}
                    </div>
                ))}
            </div>
        </div>
    );
}
