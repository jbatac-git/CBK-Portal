import { getCroppedImageBlob } from '@/lib/cropImage';
import Cropper, { Area } from 'react-easy-crop';
import { useCallback, useState } from 'react';
import Button from '@/Components/UI/Button';

interface ImageCropperProps {
    /** Object URL of the image the user picked. */
    imageSrc: string;
    /** Crop frame aspect ratio, e.g. 1 for a square avatar/logo. */
    aspect?: number;
    processing?: boolean;
    onCancel: () => void;
    onSave: (blob: Blob) => void;
}

export default function ImageCropper({
    imageSrc,
    aspect = 1,
    processing = false,
    onCancel,
    onSave,
}: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [area, setArea] = useState<Area | null>(null);

    const onCropComplete = useCallback((_: Area, areaPixels: Area) => setArea(areaPixels), []);

    const save = async () => {
        if (!area) return;
        const blob = await getCroppedImageBlob(imageSrc, area);
        onSave(blob);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-4">
                <div className="relative h-72 w-full overflow-hidden rounded-lg bg-stone-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        cropShape={aspect === 1 ? 'round' : 'rect'}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <label htmlFor="zoom" className="mt-3 block text-sm text-stone-600">Zoom</label>
                <input
                    id="zoom"
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-maroon"
                />

                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="secondary" onClick={onCancel} disabled={processing}>Cancel</Button>
                    <Button onClick={save} disabled={processing}>
                        {processing ? 'Saving…' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>
    );
}