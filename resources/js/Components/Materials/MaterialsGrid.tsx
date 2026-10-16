import EmptyState from '@/Components/UI/EmptyState';
import { PortalMaterial } from '@/types/material';
import { Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, FileText, Lock, Play } from 'lucide-react';
import { ReactNode } from 'react';

interface MaterialsGridProps {
    materials: PortalMaterial[];
    /** Overrides the default empty state, e.g. when a filter hides everything. */
    empty?: ReactNode;
}

const typeMeta = {
    pdf: { label: 'Document', icon: FileText },
    video: { label: 'Video', icon: Play },
} as const;

/** Learning materials as a quiet, scannable list: one row per material. */
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
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
            {materials.map((m) => (
                <li key={m.id}>
                    <MaterialRow material={m} />
                </li>
            ))}
        </ul>
    );
}

function MaterialRow({ material: m }: { material: PortalMaterial }) {
    const meta = typeMeta[m.type] ?? typeMeta.pdf;
    const TypeIcon = m.locked ? Lock : meta.icon;

    const body = (
        <>
            <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                    m.locked ? 'bg-stone-100 text-stone-400' : 'bg-maroon-50 text-maroon-700'
                }`}
            >
                <TypeIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block truncate text-[15px] font-medium ${m.locked ? 'text-stone-500' : 'text-ink'}`}>{m.title}</span>
                <span className="mt-0.5 block truncate text-[13px] text-stone-500">
                    {m.locked ? 'Opens once your account is approved' : [meta.label, m.category].filter(Boolean).join(' · ')}
                </span>
            </span>
            {!m.locked && (
                <ChevronRight className="h-4 w-4 shrink-0 text-stone-300 transition-colors group-hover:text-maroon-700" aria-hidden="true" />
            )}
        </>
    );

    const base = 'flex items-center gap-4 px-4 py-3.5 sm:px-5';

    if (m.locked) {
        return (
            <div aria-disabled="true" className={`${base} cursor-not-allowed`}>
                <span className="sr-only">Locked: </span>
                {body}
            </div>
        );
    }

    return (
        <Link
            href={route('portal.learning.show', m.id)}
            className={`group ${base} transition-colors hover:bg-paper focus-visible:bg-paper focus-visible:outline-none`}
        >
            {body}
        </Link>
    );
}
