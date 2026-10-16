import EmptyState from '@/Components/UI/EmptyState';
import PageHeader from '@/Components/UI/PageHeader';
import DiserLayout from '@/Layouts/DiserLayout';
import { Head } from '@inertiajs/react';
import { ArrowUpRight, Globe, LucideIcon, Mail, MapPin, Phone } from 'lucide-react';

interface ContactData {
    'contact.headline': string | null;
    'contact.phone': string | null;
    'contact.email': string | null;
    'contact.website': string | null;
    'contact.location': string | null;
}

interface ContactRow {
    key: string;
    label: string;
    icon: LucideIcon;
    value: string;
    href: string;
    action: string;
    external?: boolean;
    mono?: boolean;
}

function websiteHref(value: string): string {
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function websiteLabel(value: string): string {
    return value.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export default function Index({ contact }: { contact: ContactData }) {
    const phone = contact['contact.phone']?.trim();
    const email = contact['contact.email']?.trim();
    const website = contact['contact.website']?.trim();
    const location = contact['contact.location']?.trim();

    const rows: ContactRow[] = [];

    if (phone) {
        rows.push({
            key: 'phone',
            label: 'Phone',
            icon: Phone,
            value: phone,
            href: `tel:${phone.replace(/[^\d+]/g, '')}`,
            action: 'Call',
            mono: true,
        });
    }
    if (email) {
        rows.push({ key: 'email', label: 'Email', icon: Mail, value: email, href: `mailto:${email}`, action: 'Email' });
    }
    if (website) {
        rows.push({
            key: 'website',
            label: 'Website',
            icon: Globe,
            value: websiteLabel(website),
            href: websiteHref(website),
            action: 'Visit',
            external: true,
        });
    }
    if (location) {
        rows.push({
            key: 'location',
            label: 'Office',
            icon: MapPin,
            value: location,
            href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
            action: 'Map',
            external: true,
        });
    }

    return (
        <DiserLayout>
            <Head title="Contact Us" />

            <div className="mx-auto max-w-2xl">
                <PageHeader
                    eyebrow="Contact"
                    title={contact['contact.headline'] || "Let's connect"}
                    description="Questions about products, prices or your account? Reach the CBK team here."
                />

                {rows.length === 0 ? (
                    <EmptyState
                        icon={Phone}
                        title="No contact details yet"
                        description="Contact information will appear here once the office adds it."
                    />
                ) : (
                    <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white shadow-hairline">
                        {rows.map((row) => {
                            const Icon = row.icon;

                            return (
                                <li key={row.key}>
                                    <a
                                        href={row.href}
                                        {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                        className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-paper focus-visible:bg-paper focus-visible:outline-none sm:px-5"
                                    >
                                        <Icon className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                                        <div className="min-w-0 flex-1">
                                            <p className="eyebrow">{row.label}</p>
                                            <p
                                                className={`mt-1 break-words text-[15px] text-ink ${row.mono ? 'tabular font-mono text-sm' : 'font-medium'}`}
                                            >
                                                {row.value}
                                            </p>
                                        </div>
                                        <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-stone-600 transition-colors group-hover:text-maroon-700">
                                            {row.action}
                                            {row.external && <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
                                            {row.external && <span className="sr-only">(opens in a new tab)</span>}
                                        </span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </DiserLayout>
    );
}
