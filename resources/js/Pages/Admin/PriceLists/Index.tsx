import Can from '@/Components/Shared/Can';
import Badge, { BadgeTone } from '@/Components/UI/Badge';
import { buttonClass } from '@/Components/UI/Button';
import Pagination from '@/Components/UI/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Paginated } from '@/types/pagination';
import { Option } from '@/types/user';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface PriceListRow {
    id: number;
    title: string;
    effective_date: string | null;
    status: string;
    status_label: string;
    file_url: string;
    uploaded_by: string | null;
    can_update: boolean;
    can_archive: boolean;
}

const tones: Record<string, BadgeTone> = { active: 'success', archived: 'neutral' };

export default function Index({ priceLists, filters, statuses }: {
    priceLists: Paginated<PriceListRow>;
    filters: { search?: string; status?: string };
    statuses: Option[];
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;
        router.get(route('admin.price-lists.index'), params, { preserveState: true, replace: true });
    };

    const archive = (row: PriceListRow) => {
        if (confirm(`Archive "${row.title}"?`)) {
            router.post(route('admin.price-lists.archive', row.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Price Lists">
            <Head title="Price Lists" />

            <div className="flex flex-wrap items-end justify-between gap-3">
                <form onSubmit={applyFilters} className="flex flex-wrap items-center gap-2">
                    <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search title"
                        className="w-56 rounded-md border-stone-300 text-sm shadow-sm focus:border-maroon focus:ring-maroon" />
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="rounded-md border-stone-300 text-sm shadow-sm focus:border-maroon focus:ring-maroon">
                        <option value="">All statuses</option>
                        {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <button type="submit" className={buttonClass('secondary')}>Filter</button>
                </form>

                <Can permission="price-lists.create">
                    <Link href={route('admin.price-lists.create')} className={buttonClass('primary')}>
                        + Upload price list
                    </Link>
                </Can>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Title</th>
                            <th className="px-4 py-3 font-medium">Effective date</th>
                            <th className="px-4 py-3 font-medium">Uploaded by</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {priceLists.data.map((row) => (
                            <tr key={row.id}>
                                <td className="px-4 py-3 font-medium text-stone-900">
                                    <a href={row.file_url} target="_blank" rel="noopener" className="underline">{row.title}</a>
                                </td>
                                <td className="px-4 py-3 text-stone-600">{row.effective_date ?? '—'}</td>
                                <td className="px-4 py-3 text-stone-600">{row.uploaded_by ?? '—'}</td>
                                <td className="px-4 py-3"><Badge tone={tones[row.status]}>{row.status_label}</Badge></td>
                                <td className="px-4 py-3 text-right space-x-3">
                                    {row.can_update && (
                                        <Link href={route('admin.price-lists.edit', row.id)} className="text-maroon underline">Edit</Link>
                                    )}
                                    {row.can_archive && (
                                        <button onClick={() => archive(row)} className="text-red-700 underline">Archive</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {priceLists.data.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-10 text-center text-stone-500">No price lists found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination paginator={priceLists} />
        </AdminLayout>
    );
}