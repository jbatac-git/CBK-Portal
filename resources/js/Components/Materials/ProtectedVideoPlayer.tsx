import { ProtectionNote } from '@/Components/Materials/ProtectedPdfViewer';
import { FullscreenButton, ShieldOverlay } from '@/Components/Materials/ViewerControls';
import Watermark, { WatermarkViewer } from '@/Components/Shared/Watermark';
import { useFullscreen } from '@/Hooks/useFullscreen';
import { Orientation, VideoEmbed } from '@/types/material';
import { ShieldCheck } from 'lucide-react';
import { CSSProperties, useEffect, useRef, useState } from 'react';

interface ProtectedVideoPlayerProps {
    title: string;
    viewer: WatermarkViewer;
    /** Uploaded video, served by our authorized stream route. */
    streamUrl?: string;
    /** External video (YouTube, Vimeo, Drive or a direct file). */
    embed?: VideoEmbed;
    /** Frame shape for embeds; uploaded and direct files are measured instead. */
    orientation?: Orientation;
    shielded?: boolean;
}

const LANDSCAPE = 16 / 9;
const PORTRAIT = 9 / 16;

// Screen Orientation lock is only typed in newer DOM libs and only works in fullscreen on mobile.
type LockableOrientation = ScreenOrientation & { lock?: (o: 'landscape' | 'portrait') => Promise<void> };

export default function ProtectedVideoPlayer({ title, viewer, streamUrl, embed, orientation = 'landscape', shielded = false }: ProtectedVideoPlayerProps) {
    // Fullscreen goes on this wrapper, never the <video>/<iframe>, so the
    // watermark and the privacy shield stay on top in fullscreen too.
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { isFullscreen, supported, pseudoClass, toggle } = useFullscreen(wrapperRef);

    // A direct .mp4/.webm link plays in our own <video>; providers get an iframe.
    const videoSrc = streamUrl ?? (embed?.kind === 'direct' ? embed.src : undefined);
    const frameSrc = embed && embed.kind !== 'direct' ? embed.src : undefined;

    // Files report their real size once metadata loads; embeds use the saved orientation.
    const [measuredRatio, setMeasuredRatio] = useState<number | null>(null);
    const ratio = measuredRatio ?? (orientation === 'portrait' ? PORTRAIT : LANDSCAPE);
    const isPortrait = ratio < 1;

    useEffect(() => setMeasuredRatio(null), [videoSrc]);

    // On phones, turn the screen to match the video while it is fullscreen.
    useEffect(() => {
        const screenOrientation = (typeof screen !== 'undefined' ? screen.orientation : undefined) as LockableOrientation | undefined;
        if (!isFullscreen || !screenOrientation?.lock) return;

        screenOrientation.lock(isPortrait ? 'portrait' : 'landscape').catch(() => {
            // Desktop browsers and iOS do not allow locking; nothing to do.
        });

        return () => {
            try {
                screenOrientation.unlock();
            } catch {
                // Not locked or not supported.
            }
        };
    }, [isFullscreen, isPortrait]);

    // Inline: as wide as possible without exceeding ~72% of the viewport height,
    // so a portrait video becomes a centered column instead of a giant box.
    // Fullscreen: fill the height and let the width follow the ratio.
    const frameStyle: CSSProperties = isFullscreen
        ? { aspectRatio: String(ratio), height: '100%', maxWidth: '100%' }
        : { aspectRatio: String(ratio), width: `min(100%, calc(72vh * ${ratio}))` };

    return (
        <div>
            <div
                ref={wrapperRef}
                onContextMenu={(e) => e.preventDefault()}
                className={`flex flex-col overflow-hidden bg-ink ${isFullscreen ? 'h-full w-full' : 'rounded-xl border border-line shadow-hairline'} ${pseudoClass}`}
            >
                <div className={`flex items-center justify-center ${isFullscreen ? 'min-h-0 flex-1' : ''}`}>
                    <div className="relative mx-auto overflow-hidden" style={frameStyle}>
                        <div className={`h-full w-full transition-[filter] duration-150 ${shielded ? 'blur-2xl' : ''}`}>
                            {videoSrc && (
                                <video
                                    src={videoSrc}
                                    controls
                                    controlsList="nodownload nofullscreen noremoteplayback"
                                    disablePictureInPicture
                                    disableRemotePlayback
                                    playsInline
                                    preload="metadata"
                                    onLoadedMetadata={(e) => {
                                        const { videoWidth, videoHeight } = e.currentTarget;
                                        if (videoWidth && videoHeight) setMeasuredRatio(videoWidth / videoHeight);
                                    }}
                                    onContextMenu={(e) => e.preventDefault()}
                                    className="block h-full w-full bg-ink object-contain"
                                />
                            )}

                            {frameSrc && (
                                <iframe
                                    src={frameSrc}
                                    title={title}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    loading="lazy"
                                    className="block h-full w-full border-0 bg-ink"
                                />
                            )}
                        </div>

                        <Watermark viewer={viewer} tone="light" />
                        <ShieldOverlay visible={shielded} />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
                    <p className="flex min-w-0 items-center gap-1.5 truncate text-2xs text-white/50">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        View only · {isPortrait ? 'Portrait' : 'Landscape'}
                    </p>
                    {supported && <FullscreenButton isFullscreen={isFullscreen} onToggle={() => void toggle()} tone="light" showLabel />}
                </div>
            </div>
            <ProtectionNote />
        </div>
    );
}
