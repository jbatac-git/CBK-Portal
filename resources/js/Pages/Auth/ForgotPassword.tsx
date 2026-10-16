import AuthHeader, { AuthNotice } from '@/Components/Auth/AuthHeader';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot password" />

            <AuthHeader
                title="Reset your password"
                description="Enter the email address on your account and we will send you a link to choose a new password."
            />

            {status && <AuthNotice>{status}</AuthNotice>}

            <form onSubmit={submit} className="space-y-5">
                <Input
                    label="Email address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <Button type="submit" loading={processing} className="w-full">
                    Email reset link
                </Button>
            </form>

            <p className="mt-6 text-center text-[13px] text-stone-500">
                Remembered it?{' '}
                <Link href={route('login')} className="link">
                    Back to sign in
                </Link>
            </p>
        </GuestLayout>
    );
}
