import EmptyState from '@/Components/UI/EmptyState';
import PageHeader from '@/Components/UI/PageHeader';
import DiserLayout from '@/Layouts/DiserLayout';
import { Head } from '@inertiajs/react';
import { Briefcase } from 'lucide-react';

export default function Index() {
    return (
        <DiserLayout>
            <Head title="Careers" />

            <PageHeader
                eyebrow="Careers"
                title="Careers at CBK"
                description="Open positions and recruitment updates for the CBK team."
            />

            <EmptyState
                icon={Briefcase}
                title="No openings posted yet"
                description="Job postings and recruitment information will be listed here soon. Check back later."
            />
        </DiserLayout>
    );
}
