import AuthHeader from '@/Components/Auth/AuthHeader';
import PasswordField from '@/Components/Auth/PasswordField';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset password" />

            <AuthHeader title="Choose a new password" description="Saving it signs you out on your other devices." />

            <form onSubmit={submit} className="space-y-5">
                <Input
                    label="Email address"
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />
                <PasswordField
                    label="New password"
                    name="password"
                    autoComplete="new-password"
                    autoFocus
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    hint="At least 8 characters."
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
                    Reset password
                </Button>
            </form>
        </GuestLayout>
    );
}
