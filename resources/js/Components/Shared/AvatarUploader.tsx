import Avatar from '@/Components/Shared/Avatar';
import ImageCropper from '@/Components/Shared/ImageCropper';
import Button from '@/Components/UI/Button';
import { router } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

export default function AvatarUploader({
    currentUrl,
    name,
    firstName,
    lastName,
}: {
    currentUrl: string | null;
    name: string;
    firstName?: string;
    lastName?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [rawImage, setRawImage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Free the previous object URL whenever it is replaced or the component unmounts.
    useEffect(() => {
        return () => {
            if (rawImage) URL.revokeObjectURL(rawImage);
        };
    }, [rawImage]);

    const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setError(null);
            setRawImage(URL.createObjectURL(file));
        }
        e.target.value = ''; // allow re-selecting the same file later
    };

    const save = (blob: Blob) => {
        const form = new FormData();
        form.append('photo', blob, 'avatar.png');

        router.post(route('profile.photo.update'), form, {
            preserveScroll: true,
            onStart: () => {
                setError(null);
                setProcessing(true);
            },
            onSuccess: () => setRawImage(null),
            onError: (errors) => setError(errors.photo ?? Object.values(errors)[0] ?? 'The photo could not be uploaded.'),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="flex items-center gap-5">
            <Avatar name={name} photoUrl={currentUrl} firstName={firstName} lastName={lastName} size="lg" />

            <div className="min-w-0">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={onFileSelected}
                />
                <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
                    <Upload aria-hidden="true" />
                    {currentUrl ? 'Change photo' : 'Upload photo'}
                </Button>
                {error && !rawImage ? (
                    <p role="alert" className="mt-2 text-[13px] text-red-700">
                        {error}
                    </p>
                ) : (
                    <p className="mt-2 text-[13px] text-stone-500">PNG, JPG or WebP. You can crop it before saving.</p>
                )}
            </div>

            {rawImage && (
                <ImageCropper
                    imageSrc={rawImage}
                    aspect={1}
                    title="Crop your photo"
                    processing={processing}
                    error={error}
                    onCancel={() => setRawImage(null)}
                    onSave={save}
                />
            )}
        </div>
    );
}
