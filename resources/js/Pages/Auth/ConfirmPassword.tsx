import AuthHeader from '@/Components/Auth/AuthHeader';
import PasswordField from '@/Components/Auth/PasswordField';
import Button from '@/Components/UI/Button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm password" />

            <AuthHeader
                title="Confirm your password"
                description="This is a secure area of the portal. Enter your password again to continue."
            />

            <form onSubmit={submit} className="space-y-5">
                <PasswordField
                    label="Password"
                    name="password"
                    autoComplete="current-password"
                    autoFocus
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <Button type="submit" loading={processing} className="w-full">
                    Confirm
                </Button>
            </form>
        </GuestLayout>
    );
}
