import SettingsSection, { SettingsSections } from '@/Components/Settings/SettingsSection';
import ImageCropper from '@/Components/Shared/ImageCropper';
import Button from '@/Components/UI/Button';
import Card, { CardBody, CardFooter } from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import PageHeader from '@/Components/UI/PageHeader';
import Switch from '@/Components/UI/Switch';
import Textarea from '@/Components/UI/Textarea';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { ChangeEvent, FormEventHandler, useEffect, useRef, useState } from 'react';

interface FooterData {
    company_name: string;
    copyright: string;
    contact: string;
    website: string;
    address: string;
}

export default function Edit({
    footer,
    logo_url,
    careers_enabled,
}: {
    footer: FooterData;
    logo_url: string | null;
    careers_enabled?: boolean;
}) {
    const { features } = usePage<PageProps>().props;
    const { data, setData, put, processing, errors } = useForm({ footer });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const [rawLogo, setRawLogo] = useState<string | null>(null);
    const [logoProcessing, setLogoProcessing] = useState(false);
    const [logoError, setLogoError] = useState<string | null>(null);

    // The page prop may be absent; fall back to the shared feature flag.
    const [careersEnabled, setCareersEnabled] = useState(careers_enabled ?? features?.careers_enabled ?? false);
    const [careersSaving, setCareersSaving] = useState(false);

    // Free the previous object URL whenever it is replaced or the page unmounts.
    useEffect(() => {
        return () => {
            if (rawLogo) URL.revokeObjectURL(rawLogo);
        };
    }, [rawLogo]);

    const toggleCareers = (next: boolean) => {
        router.put(
            route('admin.settings.careers.update'),
            { careers_enabled: next },
            {
                preserveScroll: true,
                onStart: () => setCareersSaving(true),
                onSuccess: () => setCareersEnabled(next),
                onFinish: () => setCareersSaving(false),
            },
        );
    };

    const update = (field: keyof FooterData, value: string) => setData('footer', { ...data.footer, [field]: value });

    const submitFooter: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'), { preserveScroll: true });
    };

    const onLogoSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoError(null);
            setRawLogo(URL.createObjectURL(file));
        }
        e.target.value = ''; // allow re-selecting the same file later
    };

    const saveLogo = (blob: Blob) => {
        const form = new FormData();
        form.append('_method', 'PUT'); // method spoofing, same as the other forms
        form.append('logo', blob, 'logo.png');
        // The endpoint requires the footer, so send the last *saved* values —
        // never the unsaved edits in the footer form below.
        Object.entries(footer).forEach(([key, value]) => {
            form.append(`footer[${key}]`, value ?? '');
        });

        router.post(route('admin.settings.update'), form, {
            preserveScroll: true,
            onStart: () => {
                setLogoError(null);
                setLogoProcessing(true);
            },
            onSuccess: () => setRawLogo(null),
            onError: (errs) => setLogoError(errs.logo ?? Object.values(errs)[0] ?? 'The logo could not be uploaded.'),
            onFinish: () => setLogoProcessing(false),
        });
    };

    return (
        <AdminLayout title="Settings">
            <Head title="Settings" />

            <PageHeader title="Settings" description="Branding, footer details and optional modules for CBK Academy." />

            <SettingsSections>
                <SettingsSection title="Logo" description="Replaces the CBK Academy mark in the sidebar, sign-in screen and header.">
                    <Card>
                        <CardBody>
                            <div className="flex items-center gap-5">
                                {logo_url ? (
                                    <img
                                        src={logo_url}
                                        alt="Current logo"
                                        className="h-16 w-16 shrink-0 rounded-lg border border-line bg-paper object-contain p-1.5"
                                    />
                                ) : (
                                    <img src="/images/cbk-academy-mark.svg" alt="CBK Academy mark" className="h-16 w-16 shrink-0 rounded-[22%]" />
                                )}
                                <div className="min-w-0">
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        tabIndex={-1}
                                        aria-hidden="true"
                                        onChange={onLogoSelected}
                                    />
                                    <Button variant="secondary" size="sm" onClick={() => logoInputRef.current?.click()}>
                                        <Upload aria-hidden="true" />
                                        {logo_url ? 'Change logo' : 'Upload logo'}
                                    </Button>
                                    {logoError && !rawLogo ? (
                                        <p role="alert" className="mt-2 text-[13px] text-red-700">
                                            {logoError}
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-[13px] text-stone-500">
                                            PNG, JPG or WebP, cropped to a square. Uploads immediately.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </SettingsSection>

                <SettingsSection title="Footer" description="company details printed at the bottom of every page.">
                    <form onSubmit={submitFooter}>
                        <Card>
                            <CardBody className="space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input
                                        label="Company name"
                                        name="company_name"
                                        value={data.footer.company_name}
                                        onChange={(e) => update('company_name', e.target.value)}
                                        error={errors['footer.company_name']}
                                    />
                                    <Input
                                        label="Copyright text"
                                        name="copyright"
                                        value={data.footer.copyright}
                                        onChange={(e) => update('copyright', e.target.value)}
                                        error={errors['footer.copyright']}
                                        optional
                                    />
                                    <Input
                                        label="Contact details"
                                        name="contact"
                                        value={data.footer.contact}
                                        onChange={(e) => update('contact', e.target.value)}
                                        error={errors['footer.contact']}
                                        optional
                                    />
                                    <Input
                                        label="Website"
                                        name="website"
                                        value={data.footer.website}
                                        onChange={(e) => update('website', e.target.value)}
                                        error={errors['footer.website']}
                                        optional
                                    />
                                </div>
                                <Textarea
                                    label="Address"
                                    name="address"
                                    rows={2}
                                    value={data.footer.address}
                                    onChange={(e) => update('address', e.target.value)}
                                    error={errors['footer.address']}
                                    optional
                                />
                            </CardBody>
                            <CardFooter>
                                <Button type="submit" loading={processing}>
                                    Save footer
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </SettingsSection>

                <SettingsSection title="Modules" description="Turn optional modules on or off. Changes apply right away.">
                    <Card>
                        <CardBody>
                            <div className="flex items-start justify-between gap-6">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-ink">
                                        Careers
                                    </p>
                                    <p className="mt-0.5 text-[13px] leading-relaxed text-stone-500">
                                        Job postings and recruitment information for Disers.
                                    </p>
                                </div>
                                <Switch
                                    id="careers-toggle"
                                    label="Careers module"
                                    checked={careersEnabled}
                                    onChange={toggleCareers}
                                    disabled={careersSaving}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </SettingsSection>
            </SettingsSections>

            {rawLogo && (
                <ImageCropper
                    imageSrc={rawLogo}
                    aspect={1}
                    cropShape="rect"
                    title="Crop logo"
                    processing={logoProcessing}
                    error={logoError}
                    onCancel={() => setRawLogo(null)}
                    onSave={saveLogo}
                />
            )}
        </AdminLayout>
    );
}
