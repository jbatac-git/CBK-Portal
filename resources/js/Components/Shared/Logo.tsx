export default function Logo({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="rounded-md bg-white px-2 py-0.5 text-lg font-semibold tracking-tight text-maroon">
                CBK
            </span>
            <span className="text-sm text-white/90">Portal</span>
        </div>
    );
}