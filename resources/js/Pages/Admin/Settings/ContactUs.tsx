import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
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

    const update = (field: keyof ContactData, value: string) =>
        setData('contact', { ...data.contact, [field]: value });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.contact-us.update'));
    };

    return (
        <AdminLayout title="Contact Us">
            <Head title="Contact Us" />

            <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border border-stone-200 bg-white p-5">
                <Input label="Friendly headline" name="headline" value={data.contact.headline}
                    onChange={(e) => update('headline', e.target.value)} error={errors['contact.headline']} />
                <Input label="Contact number" name="phone" value={data.contact.phone}
                    onChange={(e) => update('phone', e.target.value)} error={errors['contact.phone']} />
                <Input label="Email address" name="email" type="email" value={data.contact.email}
                    onChange={(e) => update('email', e.target.value)} error={errors['contact.email']} />
                <Input label="Company website" name="website" value={data.contact.website}
                    onChange={(e) => update('website', e.target.value)} error={errors['contact.website']} />
                <Input label="Company location" name="location" value={data.contact.location}
                    onChange={(e) => update('location', e.target.value)} error={errors['contact.location']} />

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>Save changes</Button>
                </div>
            </form>
        </AdminLayout>
    );
}