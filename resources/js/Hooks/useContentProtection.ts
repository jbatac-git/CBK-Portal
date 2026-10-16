import { RefObject, useEffect, useState } from 'react';

/** How long the shield stays up after PrintScreen while the window keeps focus. */
const PRINT_SCREEN_SHIELD_MS = 2500;

/**
 * Deterrents for protected learning content.
 *
 * Browsers cannot block OS-level screenshots or a phone camera. What this
 * does: hides the content whenever the window loses focus or the tab is
 * hidden (most screenshot/recording tools steal focus), reacts to
 * PrintScreen, and blocks the easy save/print/inspect shortcuts, the context
 * menu, copying and dragging. The watermark is what makes any capture that
 * still happens traceable.
 */
export function useContentProtection<T extends HTMLElement>(areaRef: RefObject<T | null>) {
    const [shielded, setShielded] = useState(false);

    useEffect(() => {
        let printTimer: number | undefined;
        let blurCheck: number | undefined;
        let printShieldActive = false;

        const show = () => {
            window.clearTimeout(printTimer);
            printShieldActive = false;
            setShielded(false);
        };

        // Once focus is inside an embedded player, the parent window gets no
        // further blur/focus events, so switching apps from there is caught
        // by polling hasFocus() (true while focus is in a child frame).
        const poll = window.setInterval(() => {
            const present = document.visibilityState === 'visible' && document.hasFocus();

            if (!present) setShielded(true);
            else if (!printShieldActive) setShielded(false);
        }, 400);

        const onBlur = () => {
            // Clicking into an embedded player (YouTube/Vimeo/Drive iframe)
            // also blurs the window. That is not leaving the page, so do not
            // hide the video the user just pressed play on.
            window.clearTimeout(blurCheck);
            blurCheck = window.setTimeout(() => {
                const active = document.activeElement;
                const inOwnPlayer = active instanceof HTMLIFrameElement && areaRef.current?.contains(active);

                if (!inOwnPlayer) setShielded(true);
            }, 0);
        };

        const onVisibility = () => {
            if (document.visibilityState === 'hidden') setShielded(true);
            else if (document.hasFocus()) show();
        };

        const onKeyDown = (e: KeyboardEvent) => {
            const mod = e.ctrlKey || e.metaKey;
            const key = e.key.toLowerCase();

            const blocked =
                (mod && !e.shiftKey && (key === 'p' || key === 's')) ||
                (mod && e.shiftKey && ['s', 'i', 'c', 'j'].includes(key)) ||
                e.key === 'F12';

            if (blocked) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key !== 'PrintScreen') return;

            setShielded(true);
            printShieldActive = true;
            window.clearTimeout(printTimer);
            printTimer = window.setTimeout(() => {
                printShieldActive = false;
                setShielded(false);
            }, PRINT_SCREEN_SHIELD_MS);

            // Best effort: overwrite whatever the screenshot put on the
            // clipboard. Fails silently without clipboard permission.
            try {
                void navigator.clipboard?.writeText('').catch(() => undefined);
            } catch {
                // Clipboard API unavailable.
            }
        };

        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', show);
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('keyup', onKeyUp, true);

        return () => {
            window.clearInterval(poll);
            window.clearTimeout(printTimer);
            window.clearTimeout(blurCheck);
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('focus', show);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('keydown', onKeyDown, true);
            window.removeEventListener('keyup', onKeyUp, true);
        };
    }, [areaRef]);

    // Context menu, copy and drag are only blocked inside the protected area,
    // so the rest of the page (navigation, header) behaves normally.
    useEffect(() => {
        const area = areaRef.current;
        if (!area) return;

        const block = (e: Event) => e.preventDefault();
        const events = ['contextmenu', 'dragstart', 'copy', 'cut', 'selectstart'] as const;

        events.forEach((name) => area.addEventListener(name, block));
        return () => events.forEach((name) => area.removeEventListener(name, block));
    }, [areaRef]);

    return { shielded };
}
