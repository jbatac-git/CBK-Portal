import { ProtectionNote } from '@/Components/Materials/ProtectedPdfViewer';
import { FullscreenButton, ShieldOverlay } from '@/Components/Materials/ViewerControls';
import Watermark, { WatermarkViewer } from '@/Components/Shared/Watermark';
import { useFullscreen } from '@/Hooks/useFullscreen';
import { VideoEmbed } from '@/types/material';
import { ShieldCheck } from 'lucide-react';
import { useRef } from 'react';

interface ProtectedVideoPlayerProps {
    title: string;
    viewer: WatermarkViewer;
    /** Uploaded video, served by our authorized stream route. */
    streamUrl?: string;
    /** External video (YouTube, Vimeo, Drive or a direct file). */
    embed?: VideoEmbed;
    shielded?: boolean;
}

export default function ProtectedVideoPlayer({ title, viewer, streamUrl, embed, shielded = false }: ProtectedVideoPlayerProps) {
    // Fullscreen goes on this wrapper, never the <video>/<iframe>, so the
    // watermark and the privacy shield stay on top in fullscreen too.
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { isFullscreen, supported, toggle } = useFullscreen(wrapperRef);

    // A direct .mp4/.webm link plays in our own <video>; providers get an iframe.
    const videoSrc = streamUrl ?? (embed?.kind === 'direct' ? embed.src : undefined);
    const frameSrc = embed && embed.kind !== 'direct' ? embed.src : undefined;

    return (
        <div>
            <div
                ref={wrapperRef}
                onContextMenu={(e) => e.preventDefault()}
                className={`flex flex-col overflow-hidden bg-ink ${
                    isFullscreen ? 'h-full w-full' : 'rounded-xl border border-line shadow-hairline'
                }`}
            >
                <div className={`relative ${isFullscreen ? 'min-h-0 flex-1' : ''}`}>
                    <div className={`transition-[filter] duration-150 ${shielded ? 'blur-2xl' : ''} ${isFullscreen ? 'h-full' : ''}`}>
                        {videoSrc && (
                            <video
                                src={videoSrc}
                                controls
                                controlsList="nodownload nofullscreen noremoteplayback"
                                disablePictureInPicture
                                disableRemotePlayback
                                playsInline
                                preload="metadata"
                                onContextMenu={(e) => e.preventDefault()}
                                className={`block w-full bg-ink ${isFullscreen ? 'h-full' : 'aspect-video max-h-[70vh]'}`}
                            />
                        )}

                        {frameSrc && (
                            <div className={isFullscreen ? 'h-full' : 'aspect-video'}>
                                <iframe
                                    src={frameSrc}
                                    title={title}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    loading="lazy"
                                    className="block h-full w-full border-0 bg-ink"
                                />
                            </div>
                        )}
                    </div>

                    <Watermark viewer={viewer} tone="light" />
                    <ShieldOverlay visible={shielded} />
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-1.5">
                    <p className="flex min-w-0 items-center gap-1.5 truncate text-2xs text-white/50">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        View only
                    </p>
                    {supported && <FullscreenButton isFullscreen={isFullscreen} onToggle={() => void toggle()} tone="light" />}
                </div>
            </div>
            <ProtectionNote />
        </div>
    );
}
