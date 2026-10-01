import Watermark from '@/Components/Shared/Watermark';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useEffect, useRef, useState } from 'react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function ProtectedPdfViewer({ streamUrl, username }: { streamUrl: string; username: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const docRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        pdfjsLib.getDocument({ url: streamUrl, withCredentials: true }).promise
            .then((doc) => {
                if (cancelled) return;
                docRef.current = doc;
                setPageCount(doc.numPages);
                setLoading(false);
            })
            .catch(() => !cancelled && setError('Unable to load this document.'));

        return () => {
            cancelled = true;
            docRef.current?.destroy();
        };
    }, [streamUrl]);

    useEffect(() => {
        const doc = docRef.current;
        const canvas = canvasRef.current;
        if (!doc || !canvas) return;

        let cancelled = false;

        doc.getPage(page).then((pdfPage) => {
            if (cancelled) return;

            const viewport = pdfPage.getViewport({ scale: 1.4 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const context = canvas.getContext('2d');
            if (!context) return;

            pdfPage.render({ canvasContext: context, viewport });
        });

        return () => {
            cancelled = true;
        };
    }, [page, pageCount]);

    return (
        <div>
            <div
                onContextMenu={(e) => e.preventDefault()}
                className="relative overflow-auto rounded-lg border border-stone-200 bg-white p-4"
                style={{ maxHeight: '70vh' }}
            >
                {loading && <p className="py-10 text-center text-sm text-stone-500">Loading document…</p>}
                {error && <p className="py-10 text-center text-sm text-red-600">{error}</p>}
                <canvas ref={canvasRef} className="mx-auto max-w-full" />
                <Watermark username={username} />
            </div>

            {pageCount > 0 && (
                <div className="mt-3 flex items-center justify-center gap-4 text-sm">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="rounded-md border border-stone-300 px-3 py-1 disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <span className="text-stone-600">Page {page} of {pageCount}</span>
                    <button
                        type="button"
                        disabled={page >= pageCount}
                        onClick={() => setPage((p) => p + 1)}
                        className="rounded-md border border-stone-300 px-3 py-1 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}

            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-stone-500">
                View only. Downloading or sharing this material is not permitted.
            </p>
        </div>
    );
}