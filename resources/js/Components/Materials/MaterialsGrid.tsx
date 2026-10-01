import { PortalMaterial } from '@/types/material';
import { Link } from '@inertiajs/react';
import { BookOpen, Lock, PlayCircle } from 'lucide-react';

export default function MaterialsGrid({ materials }: { materials: PortalMaterial[] }) {
    if (materials.length === 0) {
        return <p className="text-center text-sm text-stone-500">No learning materials yet.</p>;
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {materials.map((m) => {
                const Icon = m.type === 'video' ? PlayCircle : BookOpen;

                const tile = (
                    <div
                        className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center text-sm ${
                            m.locked
                                ? 'cursor-not-allowed border-stone-200 bg-stone-50 text-stone-400'
                                : 'border-stone-200 bg-white text-stone-800 hover:border-maroon'
                        }`}
                    >
                        {m.locked ? <Lock className="h-6 w-6" /> : <Icon className="h-6 w-6 text-maroon" />}
                        <span>{m.title}</span>
                    </div>
                );

                return m.locked ? (
                    <div key={m.id} title="Available once your account is approved">{tile}</div>
                ) : (
                    <Link key={m.id} href={route('portal.learning.show', m.id)}>
                        {tile}
                    </Link>
                );
            })}
        </div>
    );
}