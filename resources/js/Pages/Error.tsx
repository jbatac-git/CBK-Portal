import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

interface ErrorCopy {
    title: string;
    description: string;
}

const messages: Record<number, ErrorCopy> = {
    403: {
        title: "You don't have access to this page",
        description: 'This section is not available for your account or role.',
    },
    404: {
        title: 'Page not found',
        description: "The page you're looking for doesn't exist or may have moved.",
    },
    419: {
        title: 'Session expired',
        description: 'Your session has expired for your security. Please refresh and try again.',
    },
    500: {
        title: 'Something went wrong',
        description: "We're working on it. Please try again in a moment.",
    },
    503: {
        title: 'Portal under maintenance',
        description: 'CBK Portal is temporarily unavailable. Please check back shortly.',
    },
};

export default function Error({ status }: { status: number }) {
    const { auth } = usePage<PageProps>().props;
    const copy = messages[status] ?? {
        title: 'Unexpected error',
        description: 'Something unexpected happened. Please try again.',
    };

    const homeHref = auth?.user ? route('dashboard') : route('login');
    const homeLabel = auth?.user ? 'Go to dashboard' : 'Go to login';

    return (
        <div className="flex min-h-screen flex-col bg-cream">
            <Head title={`${status} – ${copy.title}`} />

            <header className="border-b-4 border-gold bg-maroon px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white px-2 py-0.5 text-lg font-semibold tracking-tight text-maroon">
                        CBK
                    </span>
                    <span className="text-sm text-white/90">Portal</span>
                </div>
            </header>

            <main className="flex flex-1 items-center justify-center px-4 py-10">
                <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center">
                    <div className="mx-auto mb-4 h-1 w-10 bg-gold" />
                    <div className="text-5xl font-semibold text-maroon">{status}</div>
                    <h1 className="mt-3 text-lg font-medium text-stone-900">{copy.title}</h1>
                    <p className="mt-2 text-sm text-stone-600">{copy.description}</p>

                    <Link
                        href={homeHref}
                        className="mt-6 inline-flex items-center justify-center rounded-md bg-maroon px-4 py-2 text-sm font-medium text-white hover:bg-maroon-dark"
                    >
                        {homeLabel}
                    </Link>
                </div>
            </main>

            <footer className="bg-maroon-dark px-6 py-4 text-center text-xs text-white/70">
                © {new Date().getFullYear()} CBK Hardware, Inc. All rights reserved.
            </footer>
        </div>
    );
}