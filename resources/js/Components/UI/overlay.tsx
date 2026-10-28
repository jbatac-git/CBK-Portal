import { X } from 'lucide-react';

/**
 * Shared look and motion for every layer that sits over a page (house style §5, §7):
 * side panels, dialogs and confirmations all dim the page the same way and move with
 * the same easing. Enter decelerates smoothly; exit is quicker and plain. Reduced
 * motion turns the movement off.
 */

const backdropMotion =
    'transition-opacity duration-200 ease-smooth data-[closed]:opacity-0 data-[leave]:duration-150 data-[leave]:ease-exit motion-reduce:transition-none';

/** The dimmed, slightly blurred page behind a centered dialog. */
export const backdropClass = `fixed inset-0 bg-ink/40 backdrop-blur-[2px] ${backdropMotion}`;

/** The dimmed page behind a side panel: no blur, so the list stays readable beside it. */
export const panelBackdropClass = `fixed inset-0 bg-ink/30 ${backdropMotion}`;

/** Centered dialogs: fade in while rising slightly from 97 %. */
export const dialogMotion =
    'transition duration-200 ease-smooth data-[closed]:translate-y-2 data-[closed]:scale-[0.97] data-[closed]:opacity-0 data-[leave]:duration-150 data-[leave]:ease-exit motion-reduce:transition-none';

/** The right-hand side panel: slides in from the edge. */
export const panelMotion =
    'transition-transform duration-300 ease-smooth data-[closed]:translate-x-full data-[leave]:duration-200 data-[leave]:ease-exit motion-reduce:transition-none';

/** The close button in the corner of every dialog and side panel. */
export function CloseButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label="Close"
            className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-md text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-maroon-500/40 disabled:pointer-events-none disabled:opacity-40"
        >
            <X className="h-4 w-4" aria-hidden="true" />
        </button>
    );
}
