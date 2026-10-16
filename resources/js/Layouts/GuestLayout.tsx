import Logo from '@/Components/Shared/Logo';
import { PropsWithChildren } from 'react';

/**
 * Split screen for sign-in flows: a brand panel on large screens, the form
 * on the right. On phones only the form shows, under a slim brand bar.
 */
export default function GuestLayout({ children }: PropsWithChildren) {
    const year = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,640px)]">
            <aside className="relative hidden overflow-hidden bg-maroon-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
                {/* Fine architectural grid — a quiet texture instead of a gradient. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
                        backgroundSize: '56px 56px',
                        maskImage: 'linear-gradient(to bottom, black 30%, transparent 90%)',
                    }}
                />

                <Logo className="relative" />

                <div className="relative max-w-md">
                    <p className="eyebrow !text-gold-300/80">Co Ban Kiat Hardware</p>
                    <p className="mt-5 font-display text-[44px] font-normal leading-[1.08] tracking-[-0.015em]">
                        Knowledge.
                        <br />
                        Tools.
                        <br />
                        <span className="italic text-gold-300">Opportunities.</span>
                    </p>
                    <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/60">
                        Training materials, price lists and company updates for the CBK team, in one place.
                    </p>
                </div>

                <p className="relative text-2xs text-white/35">© {year} CBK Hardware, Inc. All rights reserved.</p>
            </aside>

            <div className="flex min-h-screen flex-col">
                <header className="flex h-14 items-center bg-maroon-950 px-5 lg:hidden">
                    <Logo />
                </header>

                <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
                    <div className="w-full max-w-[380px] animate-rise-in">{children}</div>
                </main>

                <p className="px-5 pb-6 text-center text-2xs text-stone-400 lg:hidden">© {year} CBK Hardware, Inc.</p>
            </div>
        </div>
    );
}
