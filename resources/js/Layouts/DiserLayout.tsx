import FlashMessage from '@/Components/Shared/FlashMessage';
import Logo from '@/Components/Shared/Logo';
import { diserNav } from '@/config/navigation';
import { usePermission } from '@/Hooks/usePermission';
import { Link } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function DiserLayout({ children }: PropsWithChildren) {
    const { can } = usePermission();

    const items = diserNav.filter((item) => can(item.permission));

    return (
        <div className="flex min-h-screen flex-col bg-cream">
            <header className="sticky top-0 z-30 flex items-center justify-between border-b-4 border-gold bg-maroon px-4 py-3">
                <Logo />
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex items-center gap-1 text-sm text-white/90"
                >
                    <LogOut className="h-4 w-4" />
                    Log out
                </Link>
            </header>

            <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 pb-28 pt-4">
                <FlashMessage />
                {children}
                <p className="pt-6 text-center text-xs text-stone-500">
                    © {new Date().getFullYear()} CBK Hardware, Inc.
                </p>
            </main>

            <nav
                aria-label="Main"
                className="fixed inset-x-0 bottom-0 z-30 grid border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)]"
                style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
            >
                {items.map((item) => {
                    const Icon = item.icon;
                    const base = 'flex flex-col items-center gap-0.5 border-t-2 py-2 text-[11px]';

                    if (!item.ready) {
                        return (
                            <span key={item.label} aria-disabled="true" className={`${base} border-transparent text-stone-300`}>
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </span>
                        );
                    }

                    const active = route().current(item.active);

                    return (
                        <Link
                            key={item.label}
                            href={route(item.routeName)}
                            className={`${base} ${active ? 'border-gold text-maroon' : 'border-transparent text-stone-500'}`}
                        >
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}