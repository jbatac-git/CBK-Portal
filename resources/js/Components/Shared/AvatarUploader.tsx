import ImageCropper from '@/Components/Shared/ImageCropper';
import { router } from '@inertiajs/react';
import { ChangeEvent, useState } from 'react';
import Avatar from '@/Components/Shared/Avatar';
export default function AvatarUploader({ currentUrl, name }: { currentUrl: string | null; name: string }) {
    const [rawImage, setRawImage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

    const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setRawImage(URL.createObjectURL(file));
        }
        e.target.value = ''; // allow re-selecting the same file later
    };

    const save = (blob: Blob) => {
        const form = new FormData();
        form.append('photo', blob, 'avatar.png');

        router.post(route('profile.photo.update'), form, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onSuccess: () => setRawImage(null),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="flex items-center gap-4">
            {currentUrl ? (
                <img src={currentUrl} alt={name} className="h-20 w-20 rounded-full object-cover" />
            ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-maroon text-xl text-white">
                    {initials}
                </div>
            )}

            <label className="cursor-pointer rounded-md border border-maroon px-3 py-1.5 text-sm text-maroon hover:bg-maroon/5">
                Change photo
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFileSelected} />
            </label>

            {rawImage && (
                <ImageCropper
                    imageSrc={rawImage}
                    aspect={1}
                    processing={processing}
                    onCancel={() => setRawImage(null)}
                    onSave={save}
                />
            )}
        </div>
    );
}