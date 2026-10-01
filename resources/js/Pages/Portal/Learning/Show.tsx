import ProtectedPdfViewer from '@/Components/Materials/ProtectedPdfViewer';
import ProtectedVideoPlayer from '@/Components/Materials/ProtectedVideoPlayer';
import { usePermission } from '@/Hooks/usePermission';
import DiserLayout from '@/Layouts/DiserLayout';
import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

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

    return (
        <DiserLayout>
            <Head title={material.title} />

            <Link href={route('portal.learning.index')} className="inline-flex items-center gap-1 text-sm text-maroon">
                <ArrowLeft className="h-4 w-4" /> Back to Learning
            </Link>

            <h1 className="mt-2 text-lg font-medium text-maroon">{material.title}</h1>
            {material.description && <p className="mb-3 text-sm text-stone-600">{material.description}</p>}

            {material.type === 'pdf' ? (
                <ProtectedPdfViewer streamUrl={material.stream_url} username={user.username} />
            ) : (
                <ProtectedVideoPlayer streamUrl={material.stream_url} username={user.username} />
            )}
        </DiserLayout>
    );
}