import Button, { buttonClass } from '@/Components/UI/Button';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface FormActionsProps {
    /** Where "Cancel" goes; usually the list page the form came from. */
    cancelHref: string;
    /** "Add {item}" on create pages, "Save changes" on edit pages. */
    submitLabel: string;
    processing: boolean;
    /** Optional note on the left, e.g. what happens when saving. */
    note?: ReactNode;
}

/**
 * The one action bar for every create/edit page. It sticks to the bottom
 * of the screen so Save is always in reach on long forms, and always uses
 * the same order: Cancel (secondary) then the primary submit, right-aligned.
 */
export default function FormActions({ cancelHref, submitLabel, processing, note }: FormActionsProps) {
    return (
        <div className="sticky bottom-4 z-10 mt-8 flex items-center justify-between gap-4 rounded-lg border border-line bg-white/95 px-4 py-3 shadow-raised backdrop-blur-md sm:px-5">
            <p className="hidden min-w-0 text-[13px] text-stone-500 sm:block">{note}</p>
            <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
                <Link href={cancelHref} className={buttonClass('secondary')}>
                    Cancel
                </Link>
                <Button type="submit" loading={processing}>
                    {submitLabel}
                </Button>
            </div>
        </div>
    );
}
