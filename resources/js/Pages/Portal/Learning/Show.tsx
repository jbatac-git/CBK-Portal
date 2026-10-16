import ProtectedPdfViewer from '@/Components/Materials/ProtectedPdfViewer';
import ProtectedVideoPlayer from '@/Components/Materials/ProtectedVideoPlayer';
import PageHeader from '@/Components/UI/PageHeader';
import { usePermission } from '@/Hooks/usePermission';
import DiserLayout from '@/Layouts/DiserLayout';
import { Head } from '@inertiajs/react';
import { FileText, PlayCircle } from 'lucide-react';

interface MaterialProps {
    material: {
        id: number;
        title: string;
        description: string | null;
        type: 'pdf' | 'video';
        stream_url: string;
    };
}

export default function Show({ material }: MaterialProps) {
    const { user } = usePermission();
    const isPdf = material.type === 'pdf';
    const TypeIcon = isPdf ? FileText : PlayCircle;

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

                {isPdf ? (
                    <ProtectedPdfViewer streamUrl={material.stream_url} username={user.username} />
                ) : (
                    <ProtectedVideoPlayer streamUrl={material.stream_url} username={user.username} />
                )}
            </article>
        </DiserLayout>
    );
}
