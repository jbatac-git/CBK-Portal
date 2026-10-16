import ProtectedPdfViewer from '@/Components/Materials/ProtectedPdfViewer';
import ProtectedVideoPlayer from '@/Components/Materials/ProtectedVideoPlayer';
import PageHeader from '@/Components/UI/PageHeader';
import { useContentProtection } from '@/Hooks/useContentProtection';
import { usePermission } from '@/Hooks/usePermission';
import DiserLayout from '@/Layouts/DiserLayout';
import { Orientation, VideoEmbed } from '@/types/material';
import { Head } from '@inertiajs/react';
import { FileText, PlayCircle, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';

interface MaterialProps {
    material: {
        id: number;
        title: string;
        description: string | null;
        type: 'pdf' | 'video';
        /** Set for uploaded files (PDFs and uploaded videos). */
        stream_url?: string;
        /** Set for videos that play from an external link. */
        embed?: VideoEmbed;
        orientation: Orientation;
    };
}

export default function Show({ material }: MaterialProps) {
    const { user } = usePermission();
    const isPdf = material.type === 'pdf';
    const TypeIcon = isPdf ? FileText : PlayCircle;
    const viewer = { name: user.name, username: user.username };

    const protectedRef = useRef<HTMLDivElement>(null);
    const { shielded } = useContentProtection(protectedRef);

    return (
        <DiserLayout>
            <Head title={material.title} />

            <article className="mx-auto max-w-3xl">
                <PageHeader
                    back={{ href: route('portal.learning.index'), label: 'Learning library' }}
                    eyebrow={
                        <span className="inline-flex items-center gap-1.5">
                            <TypeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            {isPdf ? 'PDF document' : 'Video'}
                        </span>
                    }
                    title={material.title}
                    description={material.description ?? undefined}
                />

                {/* Never printed: the printout gets a short notice instead. */}
                <div ref={protectedRef} className="select-none print:hidden">
                    {isPdf && material.stream_url ? (
                        <ProtectedPdfViewer streamUrl={material.stream_url} viewer={viewer} shielded={shielded} />
                    ) : (
                        <ProtectedVideoPlayer
                            title={material.title}
                            streamUrl={material.stream_url}
                            embed={material.embed}
                            orientation={material.orientation}
                            viewer={viewer}
                            shielded={shielded}
                        />
                    )}
                </div>

                <p className="hidden items-center gap-2 rounded-lg border border-line bg-paper p-4 text-sm text-ink print:flex">
                    <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    This learning material is view-only and cannot be printed.
                </p>
            </article>
        </DiserLayout>
    );
}
