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

/** Classes that turn the wrapper into a full-viewport layer when native fullscreen is unavailable. */
const PSEUDO_CLASS = 'fixed inset-0 z-[70] h-[100dvh] w-screen';

/**
 * Fullscreen for a WRAPPER element (not the <video>/<iframe> itself), so
 * overlays inside it — the watermark and the privacy shield — stay visible.
 *
 * iPhone Safari (and some in-app browsers) cannot make an element
 * fullscreen. There the hook falls back to a "pseudo" fullscreen: the
 * wrapper covers the whole viewport and the page behind it stops scrolling.
 * Callers add `pseudoClass` to the wrapper so both modes look the same.
 */
export function useFullscreen<T extends HTMLElement>(ref: RefObject<T | null>) {
    const [isNative, setIsNative] = useState(false);
    const [isPseudo, setIsPseudo] = useState(false);

    useEffect(() => {
        // Covers every way out: our button, Escape, F11, the browser's own UI.
        const sync = () => setIsNative(ref.current !== null && fullscreenElement() === ref.current);

        document.addEventListener('fullscreenchange', sync);
        document.addEventListener('webkitfullscreenchange', sync);

        return () => {
            document.removeEventListener('fullscreenchange', sync);
            document.removeEventListener('webkitfullscreenchange', sync);
        };
    }, [ref]);

    // While the pseudo layer is open the page underneath must not scroll.
    useEffect(() => {
        if (!isPseudo) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previous;
        };
    }, [isPseudo]);

    const exit = useCallback(async () => {
        setIsPseudo(false);

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
            if (el.requestFullscreen) {
                await el.requestFullscreen({ navigationUI: 'hide' });
                return;
            }
            if (el.webkitRequestFullscreen) {
                await el.webkitRequestFullscreen();
                return;
            }
        } catch {
            // Refused (e.g. iPhone, in-app browsers): use the pseudo layer below.
        }

        setIsPseudo(true);
    }, [ref]);

    const isFullscreen = isNative || isPseudo;

    // Browsers already leave native fullscreen on Escape; the pseudo layer needs it too.
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

    return {
        isFullscreen,
        /** Always true: every browser gets either native or pseudo fullscreen. */
        supported: true,
        pseudoClass: isPseudo ? PSEUDO_CLASS : '',
        enter,
        exit,
        toggle,
    };
}
