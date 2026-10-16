import EmptyState from '@/Components/UI/EmptyState';
import PageHeader from '@/Components/UI/PageHeader';
import DiserLayout from '@/Layouts/DiserLayout';
import { Head } from '@inertiajs/react';
import { ArrowUpRight, FileText } from 'lucide-react';

interface Row {
    id: number;
    title: string;
    effective_date: string | null;
    file_url: string;
}

/** Formats a server "YYYY-MM-DD" date without shifting it across time zones. */
function formatDate(value: string): string {
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return value;
    return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(y, m - 1, d));
}

function fileExtension(url: string): string | null {
    const path = url.split(/[?#]/)[0];
    const match = /\.([a-z0-9]{2,5})$/i.exec(path);
    return match ? match[1].toUpperCase() : null;
}

export default function Index({ priceLists }: { priceLists: Row[] }) {
    return (
        <DiserLayout>
            <Head title="Price Lists" />

            <PageHeader
                eyebrow="Price lists"
                title="Latest price lists"
                description="Current prices from CBK. Open a document to view or download it."
            />

            {priceLists.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No price lists yet"
                    description="New price lists will appear here as soon as they are published."
                />
            ) : (
                <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white shadow-hairline">
                    {priceLists.map((p) => {
                        const ext = fileExtension(p.file_url);

                        return (
                            <li key={p.id}>
                                <a
                                    href={p.file_url}
                                    target="_blank"
                                    rel="noopener"
                                    className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-paper focus-visible:bg-paper focus-visible:outline-none sm:px-5"
                                >
                                    <FileText className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-stone-500">
                                            {p.effective_date ? (
                                                <span>
                                                    Effective <span className="tabular">{formatDate(p.effective_date)}</span>
                                                </span>
                                            ) : (
                                                <span>No effective date</span>
                                            )}
                                            {ext && (
                                                <>
                                                    <span aria-hidden="true" className="text-stone-300">
                                                        ·
                                                    </span>
                                                    <span className="font-mono text-2xs tracking-wide">{ext}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-stone-600 transition-colors group-hover:text-maroon-700">
                                        Open
                                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                        <span className="sr-only">(opens in a new tab)</span>
                                    </span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            )}
        </DiserLayout>
    );
}
