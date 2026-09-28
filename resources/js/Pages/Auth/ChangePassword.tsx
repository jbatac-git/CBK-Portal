import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
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

            <h1 className="text-xl font-medium text-maroon">Set your own password</h1>
            <div className="mb-4 mt-2 h-1 w-10 bg-gold" />
            <p className="mb-6 text-sm text-stone-600">
                For your security, replace the temporary password from your email before continuing.
            </p>

            <form onSubmit={submit} className="space-y-4">
                <Input
                    label="Temporary password"
                    name="current_password"
                    type="password"
                    autoComplete="current-password"
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    error={errors.current_password}
                />
                <Input
                    label="New password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />
                <Input
                    label="Confirm new password"
                    name="password_confirmation"
                    type="password"
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                />

                <div className="flex items-center justify-between pt-2">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm text-maroon underline"
                    >
                        Log out
                    </Link>
                    <Button type="submit" disabled={processing}>
                        Save password
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}