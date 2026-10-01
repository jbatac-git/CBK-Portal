import FlashMessage from '@/Components/Shared/FlashMessage';
import Logo from '@/Components/Shared/Logo';
import { adminNav } from '@/config/navigation';
import { usePermission } from '@/Hooks/usePermission';
import { Link } from '@inertiajs/react';
import { LogOut, Menu, X } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

interface AdminLayoutProps {
    title: string;
}

export default function AdminLayout({ title, children }: PropsWithChildren<AdminLayoutProps>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, can } = usePermission();

    const items = adminNav.filter((item) => can(item.permission));

    return (
        <div className="min-h-screen bg-cream lg:flex">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-maroon-dark text-white transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between border-b-2 border-gold px-4 py-4">
                    <Logo />
                    <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main">
                    {items.map((item) => {
                        const Icon = item.icon;

                        if (!item.ready) {
                            return (
                                <span
                                    key={item.label}
                                    aria-disabled="true"
                                    className="flex cursor-not-allowed items-center gap-3 rounded-md border-l-4 border-transparent px-3 py-2 text-sm text-white/40"
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="flex-1">{item.label}</span>
                                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">Soon</span>
                                </span>
                            );
                        }

                        const active = route().current(item.active);

                        return (
                            <Link
                                key={item.label}
                                href={route(item.routeName)}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-md border-l-4 px-3 py-2 text-sm ${active
                                        ? 'border-gold bg-white/15 text-white'
                                        : 'border-transparent text-white/85 hover:bg-white/10'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                            <Menu className="h-6 w-6 text-maroon" />
                        </button>
                        <h1 className="text-lg font-medium text-maroon">{title}</h1>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <Link href={route('profile.edit')} className="hidden text-right sm:block">
                            <div className="font-medium text-stone-800 hover:underline">{user.name}</div>
                            <div className="text-xs text-stone-500">{user.roles.join(', ')}</div>
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1 rounded-md border border-maroon px-3 py-1.5 text-maroon hover:bg-maroon/5"
                        >
                            <LogOut className="h-4 w-4" />
                            Log out
                        </Link>
                    </div>
                </header>

                <main className="flex-1 space-y-4 p-4 sm:p-6">
                    <FlashMessage />
                    {children}
                </main>

                <footer className="border-t border-stone-200 bg-white px-6 py-3 text-xs text-stone-500">
                    © {new Date().getFullYear()} CBK Hardware, Inc.
                </footer>
            </div>
        </div>
    );
}