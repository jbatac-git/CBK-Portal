export default function Watermark({ username }: { username: string }) {
    const rows = Array.from({ length: 7 });

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden select-none"
        >
            <div className="absolute -left-1/4 top-1/2 w-[150%] -translate-y-1/2 -rotate-[22deg] space-y-10 opacity-10">
                {rows.map((_, i) => (
                    <div key={i} className="whitespace-nowrap text-sm font-medium text-maroon">
                        {Array.from({ length: 6 }).fill(`${username}  •  `).join('')}
                    </div>
                ))}
            </div>
        </div>
    );
}