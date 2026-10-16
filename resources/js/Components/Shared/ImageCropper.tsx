import Button from '@/Components/UI/Button';
import { getCroppedImageBlob } from '@/lib/cropImage';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

interface ImageCropperProps {
    /** Object URL of the image the user picked. */
    imageSrc: string;
    /** Crop frame aspect ratio, e.g. 1 for a square avatar/logo. */
    aspect?: number;
    /** Shape of the crop guide; defaults to round for square crops. */
    cropShape?: 'round' | 'rect';
    title?: string;
    description?: string;
    processing?: boolean;
    /** Error from the server (e.g. upload validation), shown inside the dialog. */
    error?: string | null;
    onCancel: () => void;
    onSave: (blob: Blob) => void;
}

/** Modal crop step shown after a user picks an image; renders while mounted. */
export default function ImageCropper({
    imageSrc,
    aspect = 1,
    cropShape,
    title = 'Crop image',
    description = 'Drag to reposition and use the slider to zoom.',
    processing = false,
    error = null,
    onCancel,
    onSave,
}: ImageCropperProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const zoomId = useId();
    const [ready, setReady] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [area, setArea] = useState<Area | null>(null);
    const [cropping, setCropping] = useState(false);
    const [cropError, setCropError] = useState<string | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        if (dialog && !dialog.open) dialog.showModal();
        // The cropper measures its container, so mount it only once the dialog is visible.
        setReady(true);

        return () => {
            if (dialog?.open) dialog.close();
            previouslyFocused?.focus();
        };
    }, []);

    const onCropComplete = useCallback((_: Area, areaPixels: Area) => setArea(areaPixels), []);

    const busy = processing || cropping;

    const cancel = () => {
        if (!busy) onCancel();
    };

    const save = async () => {
        if (!area) return;

        setCropError(null);
        setCropping(true);
        try {
            const blob = await getCroppedImageBlob(imageSrc, area);
            onSave(blob);
        } catch {
            setCropError('This image could not be processed. Try a different file.');
        } finally {
            setCropping(false);
        }
    };

    const message = cropError ?? error;

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={(e) => {
                e.preventDefault(); // the parent decides when to unmount
                cancel();
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) cancel();
            }}
            className="w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-white p-0 shadow-overlay backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] open:animate-rise-in"
        >
            <div className="px-6 pb-5 pt-6">
                <h2 id={titleId} className="text-base font-semibold text-ink">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-stone-600">{description}</p>

                <div className="relative mt-4 h-72 w-full overflow-hidden rounded-lg bg-stone-900">
                    {ready && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            cropShape={cropShape ?? (aspect === 1 ? 'round' : 'rect')}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    )}
                </div>

                <label htmlFor={zoomId} className="sr-only">
                    Zoom
                </label>
                <div className="mt-4 flex items-center gap-3">
                    <ZoomOut className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                    <input
                        id={zoomId}
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        autoFocus
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-auto rounded-full accent-maroon-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-500/40 focus-visible:ring-offset-2"
                    />
                    <ZoomIn className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                </div>

                {message && (
                    <p role="alert" className="mt-4 text-[13px] text-red-700">
                        {message}
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-2 rounded-b-xl border-t border-line bg-paper px-6 py-3.5">
                <Button variant="secondary" onClick={cancel} disabled={busy}>
                    Cancel
                </Button>
                <Button onClick={save} loading={busy} disabled={!area}>
                    Apply
                </Button>
            </div>
        </dialog>
    );
}
