import EmptyState from '@/Components/UI/EmptyState';
import { PortalMaterial } from '@/types/material';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, BookOpen, FileText, Lock, PlayCircle } from 'lucide-react';
import { ReactNode } from 'react';

interface MaterialsGridProps {
    materials: PortalMaterial[];
    /** Overrides the default empty state, e.g. when a filter hides everything. */
    empty?: ReactNode;
}

const typeMeta = {
    pdf: { label: 'PDF', icon: FileText },
    video: { label: 'Video', icon: PlayCircle },
} as const;

export default function MaterialsGrid({ materials, empty }: MaterialsGridProps) {
    if (materials.length === 0) {
        return (
            <>
                {empty ?? (
                    <EmptyState
                        icon={BookOpen}
                        title="No learning materials yet"
                        description="Guides and training videos will appear here once they are published."
                    />
                )}
            </>
        );
    }

    return (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((m) => (
                <li key={m.id}>
                    <MaterialCard material={m} />
                </li>
            ))}
        </ul>
    );
}

function MaterialCard({ material: m }: { material: PortalMaterial }) {
    const meta = typeMeta[m.type] ?? typeMeta.pdf;
    const TypeIcon = meta.icon;

    const body = (
        <>
            <div className="flex items-center justify-between gap-3">
                <span className="eyebrow inline-flex items-center gap-1.5">
                    <TypeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {meta.label}
                </span>
                {m.locked ? (
                    <Lock className="h-4 w-4 text-stone-400" aria-hidden="true" />
                ) : (
                    <ArrowUpRight
                        className="h-4 w-4 text-stone-300 transition-colors group-hover:text-maroon-700"
                        aria-hidden="true"
                    />
                )}
            </div>
            <p className={`mt-3 line-clamp-2 text-[15px] font-medium leading-snug ${m.locked ? 'text-stone-500' : 'text-ink'}`}>
                {m.title}
            </p>
            <p className="mt-auto pt-3 text-[13px] text-stone-500">
                {m.locked ? 'Opens once your account is approved' : (m.category ?? 'Uncategorized')}
            </p>
        </>
    );

    const base = 'flex h-full min-h-[8.5rem] flex-col rounded-lg border p-4';

    if (m.locked) {
        return (
            <div
                aria-disabled="true"
                title="Available once your account is approved"
                className={`${base} cursor-not-allowed border-dashed border-line bg-paper`}
            >
                <span className="sr-only">Locked: </span>
                {body}
            </div>
        );
    }

    return (
        <Link
            href={route('portal.learning.show', m.id)}
            className={`group ${base} border-line bg-white shadow-hairline transition-[box-shadow,border-color] duration-150 hover:border-stone-300 hover:shadow-raised focus-visible:ring-2 focus-visible:ring-maroon-500/40 focus-visible:ring-offset-2`}
        >
            {body}
        </Link>
    );
}
