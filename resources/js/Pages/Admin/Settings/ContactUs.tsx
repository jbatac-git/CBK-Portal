import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface ContactData {
    'contact.headline': string;
    'contact.phone': string;
    'contact.email': string;
    'contact.website': string;
    'contact.location': string;
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
                <Input label="Friendly headline" name="contact.headline" value={data['contact.headline']}
                    onChange={(e) => setData('contact.headline', e.target.value)} error={errors['contact.headline']} />
                <Input label="Contact number" name="contact.phone" value={data['contact.phone']}
                    onChange={(e) => setData('contact.phone', e.target.value)} error={errors['contact.phone']} />
                <Input label="Email address" name="contact.email" type="email" value={data['contact.email']}
                    onChange={(e) => setData('contact.email', e.target.value)} error={errors['contact.email']} />
                <Input label="Company website" name="contact.website" value={data['contact.website']}
                    onChange={(e) => setData('contact.website', e.target.value)} error={errors['contact.website']} />
                <Input label="Company location" name="contact.location" value={data['contact.location']}
                    onChange={(e) => setData('contact.location', e.target.value)} error={errors['contact.location']} />

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>Save changes</Button>
                </div>
            </form>
        </AdminLayout>
    );
}