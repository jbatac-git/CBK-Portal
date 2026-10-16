import { RefObject, useCallback, useEffect, useState } from 'react';

// Safari (incl. iPadOS) still ships only the webkit-prefixed API.
type WebkitDocument = Document & {
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void> | void;
    webkitFullscreenEnabled?: boolean;
};
type WebkitElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };

function fullscreenElement(): Element | null {
    const doc = document as WebkitDocument;
    return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

/**
 * Fullscreen for a WRAPPER element (not the <video>/<iframe> itself), so
 * overlays inside it — the watermark and the privacy shield — stay visible.
 */
export function useFullscreen<T extends HTMLElement>(ref: RefObject<T | null>) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const doc = typeof document !== 'undefined' ? (document as WebkitDocument) : null;
    const supported = Boolean(doc && (doc.fullscreenEnabled || doc.webkitFullscreenEnabled));

    useEffect(() => {
        // Covers every way out: our button, Escape, F11, the browser's own UI.
        const sync = () => setIsFullscreen(ref.current !== null && fullscreenElement() === ref.current);

        document.addEventListener('fullscreenchange', sync);
        document.addEventListener('webkitfullscreenchange', sync);

        return () => {
            document.removeEventListener('fullscreenchange', sync);
            document.removeEventListener('webkitfullscreenchange', sync);
        };
    }, [ref]);

    const exit = useCallback(async () => {
        const d = document as WebkitDocument;
        if (!fullscreenElement()) return;

        try {
            if (d.exitFullscreen) await d.exitFullscreen();
            else await d.webkitExitFullscreen?.();
        } catch {
            // Already leaving fullscreen; the change event keeps state in sync.
        }
    }, []);

    const enter = useCallback(async () => {
        const el = ref.current as WebkitElement | null;
        if (!el) return;

        try {
            if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
            else await el.webkitRequestFullscreen?.();
        } catch {
            // Blocked by the browser (e.g. not triggered by a user gesture).
        }
    }, [ref]);

    // Browsers already leave fullscreen on Escape; this is a fallback for
    // engines that swallow the key while an embedded frame is not focused.
    useEffect(() => {
        if (!isFullscreen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') void exit();
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isFullscreen, exit]);

    // Leaving the page while fullscreen must not strand the user there.
    useEffect(() => () => void exit(), [exit]);

    const toggle = useCallback(() => (isFullscreen ? exit() : enter()), [isFullscreen, enter, exit]);

    return { isFullscreen, supported, enter, exit, toggle };
}
