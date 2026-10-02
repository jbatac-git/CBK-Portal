import DiserLayout from '@/Layouts/DiserLayout';
import { Head } from '@inertiajs/react';
import { Briefcase } from 'lucide-react';

export default function Index() {
    return (
        <DiserLayout>
            <Head title="Careers" />
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center">
                <Briefcase className="h-8 w-8 text-maroon" />
                <h1 className="text-lg font-medium text-maroon">Careers</h1>
                <p className="text-sm text-stone-500">
                    Job postings and recruitment information will be available here soon.
                </p>
            </div>
        </DiserLayout>
    );
}