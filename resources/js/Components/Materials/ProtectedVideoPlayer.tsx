import { ProtectionNote } from '@/Components/Materials/ProtectedPdfViewer';
import Watermark from '@/Components/Shared/Watermark';

export default function ProtectedVideoPlayer({ streamUrl, username }: { streamUrl: string; username: string }) {
    return (
        <div>
            <div
                onContextMenu={(e) => e.preventDefault()}
                className="relative overflow-hidden rounded-xl border border-line bg-ink shadow-hairline"
            >
                <video
                    src={streamUrl}
                    controls
                    controlsList="nodownload noremoteplayback"
                    disablePictureInPicture
                    playsInline
                    preload="metadata"
                    className="block aspect-video max-h-[70vh] w-full bg-ink"
                />
                <Watermark username={username} tone="light" />
            </div>
            <ProtectionNote />
        </div>
    );
}
