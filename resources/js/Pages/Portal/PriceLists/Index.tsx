import DiserLayout from '@/Layouts/DiserLayout';
import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';

interface Row { id: number; title: string; effective_date: string | null; file_url: string }

export default function Index({ priceLists }: { priceLists: Row[] }) {
    return (
        <DiserLayout>
            <Head title="Price Lists" />

            <h1 className="text-lg font-medium text-maroon">Latest Price Lists</h1>
            <div className="mb-4 mt-1 h-1 w-10 bg-gold" />

            <div className="space-y-3">
                {priceLists.map((p) => (
                    <a key={p.id} href={p.file_url} target="_blank" rel="noopener"
                        className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4">
                        <FileText className="h-6 w-6 text-maroon" />
                        <div className="flex-1">
                            <div className="font-medium text-stone-900">{p.title}</div>
                            {p.effective_date && <div className="text-xs text-stone-500">Effective {p.effective_date}</div>}
                        </div>
                    </a>
                ))}

                {priceLists.length === 0 && (
                    <p className="text-center text-sm text-stone-500">No price lists available yet.</p>
                )}
            </div>
        </DiserLayout>
    );
}