import AuthHeader from '@/Components/Auth/AuthHeader';
import PasswordField from '@/Components/Auth/PasswordField';
import Button from '@/Components/UI/Button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ChangePassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.change.store'), { onFinish: () => reset() });
    };

    return (
        <GuestLayout>
            <Head title="Set your password" />

            <AuthHeader
                eyebrow="First sign-in"
                title="Set your own password"
                description="You signed in with the temporary password from your email. Replace it with one only you know before continuing."
            />

            <form onSubmit={submit} className="space-y-5">
                <PasswordField
                    label="Temporary password"
                    name="current_password"
                    autoComplete="current-password"
                    autoFocus
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    error={errors.current_password}
                />
                <PasswordField
                    label="New password"
                    name="password"
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    hint="At least 8 characters, and different from your temporary password."
                />
                <PasswordField
                    label="Confirm new password"
                    name="password_confirmation"
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                />

                <Button type="submit" loading={processing} className="w-full">
                    Save password
                </Button>
            </form>

            <p className="mt-6 text-center text-[13px] text-stone-500">
                Not you?{' '}
                <Link href={route('logout')} method="post" as="button" className="link">
                    Log out
                </Link>
            </p>
        </GuestLayout>
    );
}
