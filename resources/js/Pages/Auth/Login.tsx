import AuthHeader, { AuthNotice } from '@/Components/Auth/AuthHeader';
import PasswordField from '@/Components/Auth/PasswordField';
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

            <AuthHeader title="Sign in" description="Use the username and password from your account email." />

            {status && <AuthNotice>{status}</AuthNotice>}

            <form onSubmit={submit} className="space-y-5">
                <Input
                    label="Username"
                    name="username"
                    value={data.username}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoFocus
                    onChange={(e) => setData('username', e.target.value)}
                    error={errors.username}
                    className="font-mono"
                />

                <PasswordField
                    label="Password"
                    name="password"
                    value={data.password}
                    autoComplete="current-password"
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <div className="flex items-center justify-between gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="checkbox"
                        />
                        Remember me
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')} className="link text-[13px]">
                            Forgot password?
                        </Link>
                    )}
                </div>

                <Button type="submit" loading={processing} className="w-full">
                    Sign in
                </Button>
            </form>
        </GuestLayout>
    );
}
