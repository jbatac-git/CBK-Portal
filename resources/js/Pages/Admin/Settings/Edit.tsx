import ImageCropper from '@/Components/Shared/ImageCropper';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { ChangeEvent, FormEventHandler, useState } from 'react';

interface FooterData {
    company_name: string;
    copyright: string;
    contact: string;
    website: string;
    address: string;
}

export default function Edit({ footer, logo_url }: { footer: FooterData; logo_url: string | null }) {
    const { data, setData, put, processing, errors } = useForm({ footer });
    const [rawLogo, setRawLogo] = useState<string | null>(null);
    const [logoProcessing, setLogoProcessing] = useState(false);

    const update = (field: keyof FooterData, value: string) =>
        setData('footer', { ...data.footer, [field]: value });

    const submitFooter: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'));
    };

    const onLogoSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setRawLogo(URL.createObjectURL(file));
        e.target.value = '';
    };

  const saveLogo = (blob: Blob) => {
    const form = new FormData();
    form.append('_method', 'PUT'); // <-- idinagdag: method spoofing, kasing-paraan ng ibang forms
    form.append('logo', blob, 'logo.png');
    Object.entries(data.footer).forEach(([key, value]) => {
        form.append(`footer[${key}]`, value as string);
    });

    router.post(route('admin.settings.update'), form, {
        preserveScroll: true,
        onStart: () => setLogoProcessing(true),
        onSuccess: () => setRawLogo(null),
        onFinish: () => setLogoProcessing(false),
    });
};

    return (
        <AdminLayout title="Portal Settings">
            <Head title="Portal Settings" />

            <div className="max-w-xl space-y-6">
                <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
                    <h2 className="text-base font-medium text-maroon">Portal logo</h2>
                    <div className="flex items-center gap-4">
                        {logo_url ? (
                            <img src={logo_url} alt="CBK logo" className="h-16 w-16 rounded-lg object-contain" />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-maroon text-sm text-white">CBK</div>
                        )}
                        <label className="cursor-pointer rounded-md border border-maroon px-3 py-1.5 text-sm text-maroon hover:bg-maroon/5">
                            Change logo
                            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onLogoSelected} />
                        </label>
                    </div>
                </section>

                <form onSubmit={submitFooter} className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
                    <h2 className="text-base font-medium text-maroon">Footer information</h2>
                    <Input label="Company name" name="company_name" value={data.footer.company_name}
                        onChange={(e) => update('company_name', e.target.value)} error={errors['footer.company_name']} />
                    <Input label="Copyright text" name="copyright" value={data.footer.copyright}
                        onChange={(e) => update('copyright', e.target.value)} error={errors['footer.copyright']} />
                    <Input label="Contact details" name="contact" value={data.footer.contact}
                        onChange={(e) => update('contact', e.target.value)} error={errors['footer.contact']} />
                    <Input label="Website" name="website" value={data.footer.website}
                        onChange={(e) => update('website', e.target.value)} error={errors['footer.website']} />
                    <Input label="Address" name="address" value={data.footer.address}
                        onChange={(e) => update('address', e.target.value)} error={errors['footer.address']} />

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>Save footer</Button>
                    </div>
                </form>
            </div>

            {rawLogo && (
                <ImageCropper
                    imageSrc={rawLogo}
                    aspect={1}
                    processing={logoProcessing}
                    onCancel={() => setRawLogo(null)}
                    onSave={saveLogo}
                />
            )}
        </AdminLayout>
    );
}