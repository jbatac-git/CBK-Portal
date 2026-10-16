import Can from '@/Components/Shared/Can';
import Badge, { BadgeTone } from '@/Components/UI/Badge';
import { buttonClass } from '@/Components/UI/Button';
import Pagination from '@/Components/UI/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Paginated } from '@/types/pagination';
import { AdminMaterial, Category } from '@/types/material';
import { Option } from '@/types/user';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface IndexProps {
    materials: Paginated<AdminMaterial>;
    filters: { search?: string; status?: string; category?: string };
    categories: Category[];
    statuses: Option[];
}

const statusTones: Record<string, BadgeTone> = { draft: 'neutral', published: 'success', archived: 'warning' };

export default function Index({ materials, filters, categories, statuses }: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [category, setCategory] = useState(filters.category ?? '');

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;
        if (category) params.category = category;
        router.get(route('admin.learning-materials.index'), params, { preserveState: true, replace: true });
    };

    const archive = (material: AdminMaterial) => {
        if (confirm(`Archive "${material.title}"?`)) {
            router.post(route('admin.learning-materials.archive', material.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Learning Materials">
            <Head title="Learning Materials" />

            <div className="flex flex-wrap items-end justify-between gap-3">
                <form onSubmit={applyFilters} className="flex flex-wrap items-center gap-2">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search title"
                        className="w-56 rounded-md border-stone-300 text-sm shadow-sm focus:border-maroon focus:ring-maroon"
                    />
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="rounded-md border-stone-300 text-sm shadow-sm focus:border-maroon focus:ring-maroon">
                        <option value="">All statuses</option>
                        {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                        className="rounded-md border-stone-300 text-sm shadow-sm focus:border-maroon focus:ring-maroon">
                        <option value="">All categories</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="submit" className={buttonClass('secondary')}>Filter</button>
                </form>

                <div className="flex gap-2">
                    <Link href={route('admin.learning-material-categories.index')} className={buttonClass('secondary')}>
                        Categories
                    </Link>
                    <Can permission="learning-materials.create">
                        <Link href={route('admin.learning-materials.create')} className={buttonClass('primary')}>
                            + Upload material
                        </Link>
                    </Can>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Title</th>
                            <th className="px-4 py-3 font-medium">Category</th>
                            <th className="px-4 py-3 font-medium">Type</th>
                            <th className="px-4 py-3 font-medium">Size</th>
                            <th className="px-4 py-3 font-medium">Temp access</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {materials.data.map((m) => (
                            <tr key={m.id}>
                                <td className="px-4 py-3 font-medium text-stone-900">{m.title}</td>
                                <td className="px-4 py-3 text-stone-600">{m.category ?? '—'}</td>
                                <td className="px-4 py-3 text-stone-600">{m.type_label}</td>
                                <td className="px-4 py-3 text-stone-600">{m.file_size_label}</td>
                                <td className="px-4 py-3">{m.available_during_temporary ? 'Yes' : 'No'}</td>
                                <td className="px-4 py-3">
                                    <Badge tone={statusTones[m.status]}>{m.status_label}</Badge>
                                </td>
                                <td className="px-4 py-3 text-right space-x-3">
                                    {m.can_update && (
                                        <Link href={route('admin.learning-materials.edit', m.id)} className="text-maroon underline">
                                            Edit
                                        </Link>
                                    )}
                                    {m.can_archive && m.status !== 'archived' && (
                                        <button onClick={() => archive(m)} className="text-red-700 underline">
                                            Archive
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {materials.data.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-10 text-center text-stone-500">No materials found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination paginator={materials} />
        </AdminLayout>
    );
}