import FlashMessage from '@/Components/Shared/FlashMessage';
import Logo from '@/Components/Shared/Logo';
import { diserNav } from '@/config/navigation';
import { usePermission } from '@/Hooks/usePermission';
import { Link } from '@inertiajs/react';
import { Clock, Lock, LogOut } from 'lucide-react';
import { PropsWithChildren } from 'react';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import Avatar from '@/Components/Shared/Avatar';
export default function DiserLayout({ children }: PropsWithChildren) {
    const { user, can } = usePermission();
    const { branding } = usePage<PageProps>().props;
    const items = diserNav.filter(
        (item) => can(item.permission) && (!item.featureFlag || features[item.featureFlag]),
    );
    return (
        <div className="flex min-h-screen flex-col bg-cream">
            <header className="sticky top-0 z-30 flex items-center justify-between border-b-4 border-gold bg-maroon px-4 py-3">
                <Logo />
                <div className="flex items-center gap-3">
                    <Link href={route('profile.edit')}>
                        <Avatar name={user.name} photoUrl={user.profile_photo_url} size="sm" />
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-1 text-sm text-white/90"
                    >
                        <LogOut className="h-4 w-4" />
                        Log out
                    </Link>
                </div>
            </header>

            <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 pb-28 pt-4">
                {user.is_temporary && (
                    <div className="rounded-lg border border-gold bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        <Clock className="mr-1 inline h-4 w-4" aria-hidden="true" />
                        Temporary access: {user.temporary_days_left} day(s) left. Only the initial learning
                        materials are available until your account is approved.
                    </div>
                )}

                <FlashMessage />
                {children}
                <p className="pt-6 text-center text-xs text-stone-500">
                    {branding.footer.copyright || `© ${new Date().getFullYear()} ${branding.footer.company_name || 'CBK Hardware, Inc.'}`}
                </p>
            </main>

            <nav
                aria-label="Main"
                className="fixed inset-x-0 bottom-0 z-30 grid border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)]"
                style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
            >
                {items.map((item) => {
                    const base = 'flex flex-col items-center gap-0.5 border-t-2 py-2 text-[11px]';
                    const locked = user.is_temporary && !item.temporary;
                    const Icon = locked ? Lock : item.icon;

                    if (!item.ready || locked) {
                        return (
                            <span
                                key={item.label}
                                aria-disabled="true"
                                title={locked ? 'Available after your account is approved' : 'Coming soon'}
                                className={`${base} border-transparent text-stone-300`}
                            >
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