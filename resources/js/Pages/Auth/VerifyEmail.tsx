import AuthHeader, { AuthNotice } from '@/Components/Auth/AuthHeader';
import Button from '@/Components/UI/Button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verify your email" />

            <AuthHeader
                title="Verify your email"
                description="We sent a verification link to your email address. Open it to activate your account. If it did not arrive, we can send another."
            />

            {status === 'verification-link-sent' && (
                <AuthNotice>A new verification link has been sent to your email address.</AuthNotice>
            )}

            <form onSubmit={submit}>
                <Button type="submit" loading={processing} className="w-full">
                    Resend verification email
                </Button>
            </form>

            <p className="mt-6 text-center text-[13px] text-stone-500">
                Wrong account?{' '}
                <Link href={route('logout')} method="post" as="button" className="link">
                    Log out
                </Link>
            </p>
        </GuestLayout>
    );
}
