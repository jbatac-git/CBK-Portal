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
    const { data, setData, put, processing, errors } = useForm({ ...contact });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.contact-us.update'));
    };

    return (
        <AdminLayout title="Contact Us">
            <Head title="Contact Us" />

            <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border border-stone-200 bg-white p-5">
                <Input label="Friendly headline" name="headline" value={data.headline}
                    onChange={(e) => setData('headline', e.target.value)} error={errors.headline} />
                <Input label="Contact number" name="phone" value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)} error={errors.phone} />
                <Input label="Email address" name="email" type="email" value={data.email}
                    onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                <Input label="Company website" name="website" value={data.website}
                    onChange={(e) => setData('website', e.target.value)} error={errors.website} />
                <Input label="Company location" name="location" value={data.location}
                    onChange={(e) => setData('location', e.target.value)} error={errors.location} />

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>Save changes</Button>
                </div>
            </form>
        </AdminLayout>
    );
}