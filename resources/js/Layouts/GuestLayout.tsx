import Logo from '@/Components/Shared/Logo';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-cream">
            <header className="border-b-4 border-gold bg-maroon px-6 py-4">
                <Logo />
            </header>

            <main className="flex flex-1 items-center justify-center px-4 py-10">
                <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
                    {children}
                </div>
            </main>

            <footer className="bg-maroon-dark px-6 py-4 text-center text-xs text-white/70">
                © {new Date().getFullYear()} CBK Hardware, Inc. All rights reserved.
            </footer>
        </div>
    );
}