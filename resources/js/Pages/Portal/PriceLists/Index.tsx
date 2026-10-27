import EmptyState from '@/Components/UI/EmptyState';
import PageHeader from '@/Components/UI/PageHeader';
import DiserLayout from '@/Layouts/DiserLayout';
import { Head } from '@inertiajs/react';
import { ArrowUpRight, Download, FileSpreadsheet, FileText } from 'lucide-react';

interface Row {
    id: number;
    title: string;
    effective_date: string | null;
    file_url: string;
    file_type: 'pdf' | 'xlsx';
    file_label: string;
}

/** Formats a server "YYYY-MM-DD" date without shifting it across time zones. */
function formatDate(value: string): string {
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return value;
    return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(y, m - 1, d));
}

export default function Index({ priceLists }: { priceLists: Row[] }) {
    return (
        <DiserLayout>
            <Head title="Price Lists" />

            <PageHeader
                eyebrow="Price lists"
                title="Latest price lists"
                description="Current prices from CBK. PDFs open in a new tab; Excel files download as a copy marked with your name."
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
                        const isExcel = p.file_type === 'xlsx';
                        const Icon = isExcel ? FileSpreadsheet : FileText;

                        return (
                            <li key={p.id}>
                                <a
                                    href={p.file_url}
                                    {...(isExcel ? { download: true } : { target: '_blank', rel: 'noopener' })}
                                    className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-paper focus-visible:bg-paper focus-visible:outline-none sm:px-5"
                                >
                                    <Icon className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
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
                                            <span aria-hidden="true" className="text-stone-300">
                                                ·
                                            </span>
                                            <span className="font-mono text-2xs tracking-wide">{p.file_label.toUpperCase()}</span>
                                        </p>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-stone-600 transition-colors group-hover:text-maroon-700">
                                        {isExcel ? (
                                            <>
                                                Download
                                                <Download className="h-4 w-4" aria-hidden="true" />
                                            </>
                                        ) : (
                                            <>
                                                Open
                                                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                                <span className="sr-only">(opens in a new tab)</span>
                                            </>
                                        )}
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
