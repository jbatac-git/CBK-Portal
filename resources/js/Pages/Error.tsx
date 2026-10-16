import { buttonClass } from '@/Components/UI/Button';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface ErrorCopy {
    title: string;
    description: string;
}

const messages: Record<number, ErrorCopy> = {
    403: {
        title: "You don't have access to this page",
        description: 'This section is not available for your account or role. If you think it should be, ask your administrator.',
    },
    404: {
        title: 'Page not found',
        description: "The page you're looking for doesn't exist or may have moved.",
    },
    419: {
        title: 'Session expired',
        description: 'Your session expired for your security. Refresh the page and try again.',
    },
    500: {
        title: 'Something went wrong',
        description: 'Something went wrong on our side. Please try again in a moment.',
    },
    503: {
        title: 'Under maintenance',
        description: 'CBK Academy is temporarily unavailable. Please check back shortly.',
    },
};

export default function Error({ status }: { status: number }) {
    const { auth } = usePage<PageProps>().props;
    const copy = messages[status] ?? {
        title: 'Unexpected error',
        description: 'Something unexpected happened. Please try again.',
    };

    const homeHref = auth?.user ? route('dashboard') : route('login');
    const homeLabel = auth?.user ? 'Back to dashboard' : 'Go to sign in';

    return (
        <div className="flex min-h-screen flex-col bg-paper">
            <Head title={`${status} – ${copy.title}`} />

            <main className="flex flex-1 items-center justify-center px-5 py-16">
                <div className="w-full max-w-md animate-rise-in text-center">
                    <p className="eyebrow">CBK Academy</p>
                    <p className="tabular mt-4 font-display text-[120px] font-light leading-none tracking-[-0.04em] text-maroon-800 sm:text-[148px]"
                    >
                        {status}
                    </p>
                    <h1 className="mt-6 text-xl font-semibold text-ink">{copy.title}</h1>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-600">{copy.description}</p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                        <Link href={homeHref} className={buttonClass('primary')}>
                            <ArrowLeft aria-hidden="true" />
                            {homeLabel}
                        </Link>
                        {status === 419 && (
                            <button type="button" onClick={() => window.location.reload()} className={buttonClass('secondary')}>
                                Refresh page
                            </button>
                        )}
                    </div>
                </div>
            </main>

            <footer className="px-5 pb-8 text-center text-2xs text-stone-400">
                © {new Date().getFullYear()} CBK Hardware, Inc.
            </footer>
        </div>
    );
}
