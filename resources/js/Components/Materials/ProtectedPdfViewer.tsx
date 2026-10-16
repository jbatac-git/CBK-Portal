import Watermark from '@/Components/Shared/Watermark';
import Button from '@/Components/UI/Button';
import { ChevronLeft, ChevronRight, FileWarning, ShieldCheck } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useEffect, useRef, useState } from 'react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const SCALE = 1.4;

type Status = 'loading' | 'ready' | 'error';

export default function ProtectedPdfViewer({ streamUrl, username }: { streamUrl: string; username: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
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

                const viewport = pdfPage.getViewport({ scale: SCALE });
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
    }, [doc, page]);

    const pageCount = doc?.numPages ?? 0;

    return (
        <div>
            <div className="overflow-hidden rounded-xl border border-line bg-white shadow-hairline">
                <div
                    onContextMenu={(e) => e.preventDefault()}
                    className="relative max-h-[70vh] min-h-[16rem] select-none overflow-auto bg-stone-100/70 p-3 sm:p-6"
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
                    {status === 'ready' && <Watermark username={username} />}
                </div>

                {pageCount > 0 && status === 'ready' && (
                    <div className="flex items-center justify-between gap-3 border-t border-line bg-paper px-3 py-2">
                        <button
                            type="button"
                            aria-label="Previous page"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-maroon-500/40 disabled:pointer-events-none disabled:text-stone-300"
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
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-maroon-500/40 disabled:pointer-events-none disabled:text-stone-300"
                        >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
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
