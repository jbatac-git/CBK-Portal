import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <h1 className="text-xl font-medium text-maroon">Sign in to CBK Portal</h1>
            <div className="mb-6 mt-2 h-1 w-10 bg-gold" />

            {status && <div className="mb-4 text-sm text-green-700">{status}</div>}

            <form onSubmit={submit} className="space-y-4">
                <Input
                    label="Username"
                    name="username"
                    value={data.username}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoFocus
                    onChange={(e) => setData('username', e.target.value)}
                    error={errors.username}
                />

                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={data.password}
                    autoComplete="current-password"
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <label className="flex items-center gap-2 text-sm text-stone-600">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="rounded border-stone-300 text-maroon focus:ring-maroon"
                    />
                    Remember me
                </label>

                <div className="flex items-center justify-between pt-2">
                    {canResetPassword ? (
                        <Link href={route('password.request')} className="text-sm text-maroon underline">
                            Forgot password?
                        </Link>
                    ) : (
                        <span />
                    )}
                    <Button type="submit" disabled={processing}>
                        Log in
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}