import { FullscreenButton, ShieldOverlay } from '@/Components/Materials/ViewerControls';
import Watermark, { WatermarkViewer } from '@/Components/Shared/Watermark';
import Button from '@/Components/UI/Button';
import { useFullscreen } from '@/Hooks/useFullscreen';
import { ChevronLeft, ChevronRight, FileWarning, ShieldCheck } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useEffect, useRef, useState } from 'react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const SCALE = 1.4;
/** Upper bound for fit-to-width in fullscreen, so huge monitors stay sharp without runaway canvas sizes. */
const MAX_FULLSCREEN_SCALE = 3;

type Status = 'loading' | 'ready' | 'error';

interface ProtectedPdfViewerProps {
    streamUrl: string;
    viewer: WatermarkViewer;
    shielded?: boolean;
}

export default function ProtectedPdfViewer({ streamUrl, viewer, shielded = false }: ProtectedPdfViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    // Fullscreen goes on the whole reader (page + toolbar), so the watermark,
    // the privacy shield and the page controls stay visible.
    const readerRef = useRef<HTMLDivElement>(null);
    const { isFullscreen, supported, pseudoClass, toggle } = useFullscreen(readerRef);
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const [doc, setDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<Status>('loading');
    const [rendering, setRendering] = useState(false);
    const [attempt, setAttempt] = useState(0);

    // Load the document. Destroying the loading task also destroys the loaded
    // document (and aborts an in-flight load), releasing its worker resources.
    useEffect(() => {
        let cancelled = false;
        setDoc(null);
        setPage(1);
        setStatus('loading');

        const task = pdfjsLib.getDocument({ url: streamUrl, withCredentials: true });

        task.promise
            .then((loaded) => {
                if (cancelled) return;
                setDoc(loaded);
                setStatus('ready');
            })
            .catch(() => {
                if (!cancelled) setStatus('error');
            });

        return () => {
            cancelled = true;
            void task.destroy();
        };
    }, [streamUrl, attempt]);

    // Render the current page. Cancelling the previous RenderTask keeps quick
    // prev/next taps from issuing overlapping render() calls on one canvas.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!doc || !canvas) return;

        let cancelled = false;
        let renderTask: pdfjsLib.RenderTask | null = null;
        setRendering(true);

        doc.getPage(page)
            .then((pdfPage) => {
                if (cancelled) return;

                // In fullscreen, re-render to fit the available width (crisp
                // instead of CSS-upscaled); otherwise use the default scale
                // and let max-w-full shrink it on small screens.
                let scale = SCALE;
                const box = scrollRef.current;
                if (isFullscreen && box) {
                    const styles = window.getComputedStyle(box);
                    const available = box.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
                    const natural = pdfPage.getViewport({ scale: 1 }).width;
                    if (available > 0 && natural > 0) scale = Math.min(available / natural, MAX_FULLSCREEN_SCALE);
                }

                const viewport = pdfPage.getViewport({ scale });
                const ratio = window.devicePixelRatio || 1;

                canvas.width = Math.floor(viewport.width * ratio);
                canvas.height = Math.floor(viewport.height * ratio);
                canvas.style.width = `${Math.floor(viewport.width)}px`;

                renderTask = pdfPage.render({
                    canvas,
                    viewport,
                    transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined,
                });

                return renderTask.promise;
            })
            .then(() => {
                if (!cancelled) setRendering(false);
            })
            .catch((err: unknown) => {
                if (err instanceof pdfjsLib.RenderingCancelledException || cancelled) return;
                setStatus('error');
            });

        return () => {
            cancelled = true;
            renderTask?.cancel();
        };
    }, [doc, page, isFullscreen]);

    const pageCount = doc?.numPages ?? 0;
    const navButton =
        'inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-maroon-500/40 disabled:pointer-events-none disabled:text-stone-300';

    return (
        <div>
            <div
                ref={readerRef}
                className={`flex flex-col overflow-hidden bg-white ${
                    isFullscreen ? 'h-full w-full' : 'rounded-xl border border-line shadow-hairline'
                } ${pseudoClass}`}
            >
                {/* Watermark + shield sit on this non-scrolling box, so they cover the visible area at any scroll position. */}
                <div className={`relative ${isFullscreen ? 'min-h-0 flex-1' : ''}`}>
                    <div
                        ref={scrollRef}
                        onContextMenu={(e) => e.preventDefault()}
                        // Swipe left/right to turn pages on touch screens.
                        onTouchStart={(e) => {
                            const t = e.touches[0];
                            touchStart.current = { x: t.clientX, y: t.clientY };
                        }}
                        onTouchEnd={(e) => {
                            const start = touchStart.current;
                            touchStart.current = null;
                            if (!start) return;
                            const t = e.changedTouches[0];
                            const dx = t.clientX - start.x;
                            const dy = t.clientY - start.y;
                            if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
                            setPage((p) => (dx < 0 ? Math.min(pageCount, p + 1) : Math.max(1, p - 1)));
                        }}
                        className={`select-none overflow-auto bg-stone-100/70 p-3 transition-[filter] duration-150 sm:p-6 ${
                            isFullscreen ? 'h-full' : 'max-h-[70vh] min-h-[16rem]'
                        } ${shielded ? 'blur-2xl' : ''}`}
                    >
                        {status === 'loading' && <PageSkeleton />}

                        {status === 'error' && (
                            <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
                                <FileWarning className="h-5 w-5 text-stone-400" aria-hidden="true" />
                                <p className="mt-3 text-sm font-medium text-ink">This document could not be opened</p>
                                <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-stone-500">
                                    Check your connection and try again. If it keeps happening, let your supervisor know.
                                </p>
                                <Button variant="secondary" size="sm" className="mt-4" onClick={() => setAttempt((n) => n + 1)}>
                                    Try again
                                </Button>
                            </div>
                        )}

                        <canvas
                            ref={canvasRef}
                            aria-label={pageCount > 0 ? `Page ${page} of ${pageCount}` : undefined}
                            className={`mx-auto h-auto max-w-full bg-white shadow-raised transition-opacity duration-150 ${
                                status === 'ready' ? (rendering ? 'opacity-60' : 'opacity-100') : 'hidden'
                            }`}
                        />
                    </div>
                    {status === 'ready' && <Watermark viewer={viewer} />}
                    <ShieldOverlay visible={shielded} />
                </div>

                {pageCount > 0 && status === 'ready' && (
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-line bg-paper px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                        <span aria-hidden="true" />
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                aria-label="Previous page"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className={navButton}
                            >
                                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <p className="font-mono text-[13px] text-stone-600" aria-live="polite">
                                <span className="sr-only">Page </span>
                                <span className="tabular font-medium text-ink">{page}</span>
                                <span className="mx-1.5 text-stone-400">/</span>
                                <span className="tabular">{pageCount}</span>
                            </p>
                            <button
                                type="button"
                                aria-label="Next page"
                                disabled={page >= pageCount}
                                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                                className={navButton}
                            >
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="flex justify-end">
                            {supported && <FullscreenButton isFullscreen={isFullscreen} onToggle={() => void toggle()} showLabel />}
                        </div>
                    </div>
                )}
            </div>

            <ProtectionNote />
        </div>
    );
}

function PageSkeleton() {
    return (
        <div aria-busy="true" aria-label="Loading document" className="mx-auto w-full max-w-md animate-pulse rounded bg-white p-6 shadow-hairline sm:p-8">
            <div className="h-4 w-2/3 rounded bg-stone-200" />
            <div className="mt-6 space-y-2.5">
                {[100, 95, 98, 80, 92, 60].map((w, i) => (
                    <div key={i} className="h-2.5 rounded bg-stone-100" style={{ width: `${w}%` }} />
                ))}
            </div>
            <div className="mt-6 h-24 rounded bg-stone-100" />
            <div className="mt-6 space-y-2.5">
                {[96, 88, 70].map((w, i) => (
                    <div key={i} className="h-2.5 rounded bg-stone-100" style={{ width: `${w}%` }} />
                ))}
            </div>
        </div>
    );
}

export function ProtectionNote() {
    return (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-2xs text-stone-500">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
            View only. Downloading or sharing this material is not permitted.
        </p>
    );
}
