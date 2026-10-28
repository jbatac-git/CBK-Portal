import { useCallback, useState } from 'react';

interface PanelState<T> {
    open: boolean;
    /** What the panel shows. Kept after closing so the content stays while it slides out. */
    data: T | null;
    /** Changes on every opening: use it as a React key so each opening starts with a fresh form. */
    key: number;
}

/** Open/close state for a SidePanel showing one record (or a "create" form). */
export function usePanel<T>() {
    const [state, setState] = useState<PanelState<T>>({ open: false, data: null, key: 0 });

    const show = useCallback((data: T) => setState((s) => ({ open: true, data, key: s.key + 1 })), []);
    const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
    /** Changes what an open panel shows (e.g. details -> edit) and resets its content. */
    const replace = useCallback((data: T) => setState((s) => ({ ...s, data, key: s.key + 1 })), []);

    return { ...state, show, close, replace };
}

/**
 * `onSuccess` for a form in a side panel: runs `done` (usually closing the panel)
 * once the record is saved. When the server refused it with a message instead
 * (flash error, e.g. "not a valid PDF"), the panel stays open with what was typed.
 */
export function whenSaved(done: () => void) {
    return (page: { props: Record<string, unknown> }) => {
        const flash = page.props.flash as { error?: string | null } | undefined;

        if (!flash?.error) done();
    };
}
