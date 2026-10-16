import SettingsSection, { SettingsSections } from '@/Components/Settings/SettingsSection';
import Button from '@/Components/UI/Button';
import Card, { CardBody, CardFooter } from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface ContactData {
    headline: string;
    phone: string;
    email: string;
    website: string;
    location: string;
}

export default function ContactUs({ contact }: { contact: ContactData }) {
    const { data, setData, put, processing, errors } = useForm({ contact });

    const update = (field: keyof ContactData, value: string) => setData('contact', { ...data.contact, [field]: value });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.contact-us.update'), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Contact us">
            <Head title="Contact us" />

            <PageHeader title="Contact us" description="The contact details employees see on the Contact page." />

            <SettingsSections>
                <SettingsSection
                    title="Contact details"
                    description="Keep these current so employees know where to reach the office. Changes show immediately after saving."
                >
                    <form onSubmit={submit}>
                        <Card>
                            <CardBody className="space-y-5">
                                <Input
                                    label="Headline"
                                    name="headline"
                                    value={data.contact.headline}
                                    onChange={(e) => update('headline', e.target.value)}
                                    error={errors['contact.headline']}
                                    hint="A short line shown above the details, e.g. “We’re here to help.”"
                                />
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input
                                        label="Contact number"
                                        name="phone"
                                        type="tel"
                                        value={data.contact.phone}
                                        onChange={(e) => update('phone', e.target.value)}
                                        error={errors['contact.phone']}
                                    />
                                    <Input
                                        label="Email address"
                                        name="email"
                                        type="email"
                                        value={data.contact.email}
                                        onChange={(e) => update('email', e.target.value)}
                                        error={errors['contact.email']}
                                    />
                                </div>
                                <Input
                                    label="Company website"
                                    name="website"
                                    value={data.contact.website}
                                    onChange={(e) => update('website', e.target.value)}
                                    error={errors['contact.website']}
                                    optional
                                />
                                <Input
                                    label="Company location"
                                    name="location"
                                    value={data.contact.location}
                                    onChange={(e) => update('location', e.target.value)}
                                    error={errors['contact.location']}
                                    optional
                                />
                            </CardBody>
                            <CardFooter>
                                <Button type="submit" loading={processing}>
                                    Save changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </SettingsSection>
            </SettingsSections>
        </AdminLayout>
    );
}
