import Watermark from '@/Components/Shared/Watermark';

export default function ProtectedVideoPlayer({ streamUrl, username }: { streamUrl: string; username: string }) {
    return (
        <div>
            <div
                onContextMenu={(e) => e.preventDefault()}
                className="relative overflow-hidden rounded-lg border border-stone-200 bg-black"
            >
                <video
                    src={streamUrl}
                    controls
                    controlsList="nodownload noremoteplayback"
                    disablePictureInPicture
                    className="max-h-[70vh] w-full"
                />
                <Watermark username={username} />
            </div>
            <p className="mt-2 text-center text-xs text-stone-500">
                View only. Downloading or sharing this material is not permitted.
            </p>
        </div>
    );
}