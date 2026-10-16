import MaterialsGrid from '@/Components/Materials/MaterialsGrid';
import { usePermission } from '@/Hooks/usePermission';
import DiserLayout from '@/Layouts/DiserLayout';
import { PortalMaterial } from '@/types/material';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, ChevronRight, FileText, Lock, LucideIcon, Phone } from 'lucide-react';

interface QuickLink {
    label: string;
    description: string;
    icon: LucideIcon;
    permission: string;
    routeName: string;
    /** Open to temporary accounts before approval. */
    temporary: boolean;
}

const quickLinks: QuickLink[] = [
    {
        label: 'Learning',
        description: 'Product guides and training videos',
        icon: BookOpen,
        permission: 'portal.learning',
        routeName: 'portal.learning.index',
        temporary: true,
    },
    {
        label: 'Price lists',
        description: 'Current prices and effective dates',
        icon: FileText,
        permission: 'portal.price-lists',
        routeName: 'portal.price-lists.index',
        temporary: false,
    },
    {
        label: 'Contact',
        description: 'Reach the CBK team',
        icon: Phone,
        permission: 'portal.contact-us',
        routeName: 'portal.contact.index',
        temporary: false,
    },
];

function greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

export default function Home({ materials }: { materials: PortalMaterial[] }) {
    const { user, can } = usePermission();
    const links = quickLinks.filter((link) => can(link.permission));
    const preview = materials.slice(0, 6);

    return (
        <DiserLayout>
            <Head title="Home" />

            <section className="animate-rise-in pb-2">
                <p className="eyebrow">
                    {greeting()}, {user.first_name}
                </p>
                <h1 className="mt-4 font-display text-[40px] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-[56px]">
                    Knowledge. Tools.
                    <br />
                    <span className="text-maroon-700">Opportunities</span>
                    <span className="text-gold-500">.</span>
                </h1>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-stone-600">
                    Everything you need in the field, in one place: training, prices and the people to call.
                </p>
            </section>

            {links.length > 0 && (
                <section aria-labelledby="modules-heading" className="mt-10">
                    <h2 id="modules-heading" className="sr-only">
                        Go to
                    </h2>
                    <ul className="grid grid-cols-1 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        {links.map((link) => {
                            const locked = user.is_temporary && !link.temporary;
                            const Icon = locked ? Lock : link.icon;

                            const content = (
                                <>
                                    <Icon className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                                    <span className="min-w-0 flex-1">
                                        <span className={`block text-sm font-medium ${locked ? 'text-stone-500' : 'text-ink'}`}>
                                            {link.label}
                                        </span>
                                        <span className="mt-0.5 block text-[13px] text-stone-500">
                                            {locked ? 'Available after your account is approved' : link.description}
                                        </span>
                                    </span>
                                    {!locked && (
                                        <ChevronRight
                                            className="h-4 w-4 shrink-0 text-stone-300 transition-colors group-hover:text-maroon-700"
                                            aria-hidden="true"
                                        />
                                    )}
                                </>
                            );

                            const base = 'flex h-full items-center gap-3 px-5 py-4';

                            return (
                                <li key={link.routeName}>
                                    {locked ? (
                                        <div aria-disabled="true" className={`${base} cursor-not-allowed`}>
                                            {content}
                                        </div>
                                    ) : (
                                        <Link
                                            href={route(link.routeName)}
                                            className={`group ${base} transition-colors hover:bg-paper focus-visible:bg-paper focus-visible:outline-none`}
                                        >
                                            {content}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}

            {can('portal.learning') && (
                <section aria-labelledby="learning-heading" className="mt-12">
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                            <h2 id="learning-heading" className="text-[15px] font-semibold text-ink">
                                Continue learning
                            </h2>
                            <p className="mt-0.5 text-[13px] text-stone-500">The latest guides and videos for your role.</p>
                        </div>
                        {materials.length > preview.length && (
                            <Link
                                href={route('portal.learning.index')}
                                className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-maroon-700 hover:text-maroon-900"
                            >
                                View all
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                        )}
                    </div>
                    <MaterialsGrid materials={preview} />
                </section>
            )}
        </DiserLayout>
    );
}
