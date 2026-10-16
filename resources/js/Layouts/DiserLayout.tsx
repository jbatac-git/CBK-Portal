import Avatar from '@/Components/Shared/Avatar';
import FlashMessage from '@/Components/Shared/FlashMessage';
import Logo from '@/Components/Shared/Logo';
import { diserNav } from '@/config/navigation';
import { usePermission } from '@/Hooks/usePermission';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Clock, Lock, LogOut } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function DiserLayout({ children }: PropsWithChildren) {
    const { user, can } = usePermission();
    const { branding, features } = usePage<PageProps>().props;

    const items = diserNav.filter(
        (item) => item.ready && can(item.permission) && (!item.featureFlag || features[item.featureFlag]),
    );
    // Profile lives in the header avatar on mobile, so the bottom bar stays at four or five tabs.
    const tabItems = items.filter((item) => item.routeName !== 'profile.edit');
    // Reading a material is a focused view: the tab bar would sit on top of the page controls.
    const reading = route().current('portal.learning.show');

    const footer =
        branding.footer.copyright || `© ${new Date().getFullYear()} ${branding.footer.company_name || 'CBK Hardware, Inc.'}`;

    return (
        <div className="flex min-h-screen flex-col bg-paper">
            <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Link href={route('portal.home')} aria-label="CBK Academy home">
                        <Logo size={30} />
                    </Link>

                    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
                        {tabItems.map((item) => {
                            const locked = user.is_temporary && !item.temporary;
                            const active = route().current(item.active);

                            if (locked) {
                                return (
                                    <span
                                        key={item.label}
                                        title="Available after your account is approved"
                                        className="flex h-8 cursor-not-allowed items-center gap-1.5 rounded-md px-3 text-[13px] text-stone-300"
                                    >
                                        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                                        {item.label}
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={item.label}
                                    href={route(item.routeName)}
                                    aria-current={active ? 'page' : undefined}
                                    className={`flex h-8 items-center rounded-md px-3 text-[13px] font-medium transition-colors ${
                                        active ? 'bg-maroon-50 text-maroon-800' : 'text-stone-600 hover:bg-stone-100 hover:text-ink'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-1">
                        <Link
                            href={route('profile.edit')}
                            className="flex items-center gap-2 rounded-full p-0.5 pr-0.5 transition-colors hover:bg-stone-100 md:pr-3"
                            aria-label="My profile"
                        >
                            <Avatar
                                name={user.name}
                                photoUrl={user.profile_photo_url}
                                firstName={user.first_name}
                                lastName={user.last_name}
                                size="sm"
                            />
                            <span className="hidden text-[13px] font-medium text-stone-700 md:inline">{user.first_name}</span>
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-md p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-ink"
                            aria-label="Log out"
                            title="Log out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </header>

            {user.is_temporary && (
                <div className="border-b border-gold-200 bg-gold-50">
                    <div className="mx-auto flex max-w-5xl items-start gap-2.5 px-4 py-2.5 text-[13px] text-gold-700 sm:px-6">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <p>
                            <span className="font-semibold">
                                Temporary access · {user.temporary_days_left} day{user.temporary_days_left === 1 ? '' : 's'} left.
                            </span>{' '}
                            Only the starter learning materials are open until your account is approved.
                        </p>
                    </div>
                </div>
            )}

            <main className={`mx-auto w-full max-w-5xl flex-1 px-4 pt-6 sm:px-6 sm:pt-10 md:pb-16 ${reading ? 'pb-10' : 'pb-28'}`}>{children}</main>

            <footer className="mx-auto hidden w-full max-w-5xl px-6 pb-8 text-2xs text-stone-400 md:block">{footer}</footer>

            {!reading && (
            <nav
                aria-label="Main"
                className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
            >
                <div className="mx-auto grid max-w-md" style={{ gridTemplateColumns: `repeat(${tabItems.length}, minmax(0, 1fr))` }}>
                    {tabItems.map((item) => {
                        const locked = user.is_temporary && !item.temporary;
                        const Icon = locked ? Lock : item.icon;
                        const active = route().current(item.active);
                        const base = 'flex flex-col items-center gap-1 pb-2 pt-2.5 text-[10.5px] font-medium';

                        if (locked) {
                            return (
                                <span
                                    key={item.label}
                                    aria-disabled="true"
                                    title="Available after your account is approved"
                                    className={`${base} text-stone-300`}
                                >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                    {item.label}
                                </span>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={route(item.routeName)}
                                aria-current={active ? 'page' : undefined}
                                className={`${base} relative ${active ? 'text-maroon-700' : 'text-stone-500'}`}
                            >
                                {active && <span className="absolute top-0 h-0.5 w-8 rounded-b bg-maroon-700" aria-hidden="true" />}
                                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
            )}

            <FlashMessage />
        </div>
    );
}
