import DiserLayout from '@/Layouts/DiserLayout';
import { Head } from '@inertiajs/react';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';

interface ContactData {
    'contact.headline': string;
    'contact.phone': string;
    'contact.email': string;
    'contact.website': string;
    'contact.location': string;
}

export default function Index({ contact }: { contact: ContactData }) {
    const rows = [
        { icon: Phone, value: contact['contact.phone'] },
        { icon: Mail, value: contact['contact.email'] },
        { icon: Globe, value: contact['contact.website'] },
        { icon: MapPin, value: contact['contact.location'] },
    ].filter((r) => r.value);

    return (
        <DiserLayout>
            <Head title="Contact Us" />

            <div className="rounded-xl bg-maroon p-5 text-white">
                <h1 className="text-lg font-medium">{contact['contact.headline'] || "Let's Connect"}</h1>
                <div className="my-3 h-1 w-10 bg-gold" />

                <div className="space-y-1">
                    {rows.map((r, i) => {
                        const Icon = r.icon;
                        return (
                            <div key={i} className="flex items-start gap-3 border-t border-white/20 py-2 text-sm">
                                <Icon className="h-4 w-4 text-gold" />
                                {r.value}
                            </div>
                        );
                    })}
                </div>
            </div>
        </DiserLayout>
    );
}