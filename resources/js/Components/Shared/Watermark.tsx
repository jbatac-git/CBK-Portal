interface WatermarkProps {
    username: string;
    /** "dark" text for light surfaces (documents), "light" text for dark surfaces (video). */
    tone?: 'dark' | 'light';
}

/** Tiled, diagonal username overlay that ties any screenshot back to the viewer. */
export default function Watermark({ username, tone = 'dark' }: WatermarkProps) {
    const rows = Array.from({ length: 9 });
    const line = Array.from({ length: 6 }, () => username).join(' · ');

    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 select-none overflow-hidden">
            <div
                className={`absolute -left-1/4 top-1/2 w-[150%] -translate-y-1/2 -rotate-[24deg] space-y-14 font-mono text-[11px] font-medium tracking-[0.12em] ${
                    tone === 'light' ? 'text-white/[0.09]' : 'text-ink/[0.07]'
                }`}
            >
                {rows.map((_, i) => (
                    <div key={i} className={`whitespace-nowrap ${i % 2 ? 'pl-24' : ''}`}>
                        {line}
                    </div>
                ))}
            </div>
        </div>
    );
}
