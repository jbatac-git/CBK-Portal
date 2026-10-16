import Avatar from '@/Components/Shared/Avatar';
import FlashMessage from '@/Components/Shared/FlashMessage';
import Logo from '@/Components/Shared/Logo';
import { adminNav, NavGroup, NavItem } from '@/config/navigation';
import { usePermission } from '@/Hooks/usePermission';
import { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Menu, X } from 'lucide-react';
import { PropsWithChildren, useEffect, useState } from 'react';

interface AdminLayoutProps {
    /** Shown in the mobile top bar; the page body renders its own PageHeader. */
    title: string;
}

const groupOrder: NavGroup[] = ['Overview', 'People', 'Content', 'System'];

export default function AdminLayout({ title, children }: PropsWithChildren<AdminLayoutProps>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, can } = usePermission();
    const { branding } = usePage<PageProps>().props;
    const items = adminNav.filter((item) => item.ready && can(item.permission));

    // Close the mobile drawer after any navigation, including back/forward.
    useEffect(() => router.on('navigate', () => setSidebarOpen(false)), []);

    useEffect(() => {
        if (!sidebarOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSidebarOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [sidebarOpen]);

    const footer =
        branding.footer.copyright || `© ${new Date().getFullYear()} ${branding.footer.company_name || 'CBK Hardware, Inc.'}`;

    return (
        <div className="min-h-screen bg-paper lg:pl-60">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 animate-fade-in bg-ink/30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-white transition-transform duration-300 ease-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0 shadow-overlay' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center justify-between px-5">
                    <Link href={route('admin.dashboard')} aria-label="CBK Academy dashboard">
                        <Logo size={30} />
                    </Link>
                    <button
                        className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-ink lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6 pt-3" aria-label="Main">
                    {groupOrder.map((group) => {
                        const groupItems = items.filter((item) => item.group === group);
                        if (groupItems.length === 0) return null;

                        return (
                            <div key={group}>
                                {group !== 'Overview' && (
                                    <p className="mb-1 px-3 text-[11px] font-medium text-stone-400">{group}</p>
                                )}
                                <ul className="space-y-px">
                                    {groupItems.map((item) => (
                                        <SidebarLink key={item.label} item={item} />
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </nav>

                <div className="border-t border-line p-3">
                    <div className="flex items-center gap-2.5 rounded-md p-1.5">
                        <Link
                            href={route('profile.edit')}
                            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md"
                            aria-label="My profile"
                        >
                            <Avatar
                                name={user.name}
                                photoUrl={user.profile_photo_url}
                                firstName={user.first_name}
                                lastName={user.last_name}
                                size="sm"
                            />
                            <span className="min-w-0">
                                <span className="block truncate text-[13px] font-medium text-ink">{user.name}</span>
                                <span className="block truncate text-xs text-stone-500">{user.roles.join(', ')}</span>
                            </span>
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-ink"
                            aria-label="Log out"
                            title="Log out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            <div className="flex min-h-screen min-w-0 flex-col">
                <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-md lg:hidden">
                    <button
                        className="-ml-1 rounded-md p-1.5 text-stone-600 hover:bg-stone-100"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="truncate text-sm font-semibold text-ink">{title}</span>
                </header>

                <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-10 sm:py-12">{children}</main>

                <footer className="mx-auto w-full max-w-6xl px-4 pb-8 text-xs text-stone-400 sm:px-10">{footer}</footer>
            </div>

            <FlashMessage />
        </div>
    );
}

function SidebarLink({ item }: { item: NavItem }) {
    const Icon = item.icon;
    const active = route().current(item.active);

    return (
        <li>
            <Link
                href={route(item.routeName)}
                aria-current={active ? 'page' : undefined}
                className={`flex h-9 items-center gap-2.5 rounded-md px-3 text-[13.5px] transition-colors ${
                    active ? 'bg-maroon-50 font-medium text-maroon-800' : 'text-stone-600 hover:bg-stone-100/80 hover:text-ink'
                }`}
            >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-maroon-700' : 'text-stone-400'}`} aria-hidden="true" />
                {item.label}
            </Link>
        </li>
    );
}
