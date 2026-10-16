import Can from '@/Components/Shared/Can';
import Badge from '@/Components/UI/Badge';
import { buttonClass } from '@/Components/UI/Button';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import Pagination from '@/Components/UI/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminCategory } from '@/types/material';
import { Paginated } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface IndexProps {
    categories: Paginated<AdminCategory>;
    filters: { search?: string };
}

export default function Index({ categories, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleting, setDeleting] = useState<AdminCategory | null>(null);
    const [processing, setProcessing] = useState(false);

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(
            route('admin.learning-material-categories.index'),
            search ? { search } : {},
            { preserveState: true, replace: true },
        );
    };

    const confirmDelete = () => {
        if (!deleting) return;

        router.delete(route('admin.learning-material-categories.destroy', deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <AdminLayout title="Learning Material Categories">
            <Head title="Learning Material Categories" />

            <div className="flex flex-wrap items-end justify-between gap-3">
                <form onSubmit={applyFilters} className="flex items-center gap-2">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search categories"
                        className="w-56 rounded-md border-stone-300 text-sm shadow-sm focus:border-maroon focus:ring-maroon"
                    />
                    <button type="submit" className={buttonClass('secondary')}>Filter</button>
                </form>

                <div className="flex gap-2">
                    <Link href={route('admin.learning-materials.index')} className={buttonClass('secondary')}>
                        Back to materials
                    </Link>
                    <Can permission="learning-materials.create">
                        <Link href={route('admin.learning-material-categories.create')} className={buttonClass('primary')}>
                            + Add category
                        </Link>
                    </Can>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Description</th>
                            <th className="px-4 py-3 font-medium">Materials</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {categories.data.map((c) => (
                            <tr key={c.id}>
                                <td className="px-4 py-3 font-medium text-stone-900">{c.name}</td>
                                <td className="px-4 py-3 text-stone-600">{c.description ?? '—'}</td>
                                <td className="px-4 py-3 text-stone-600">{c.materials_count}</td>
                                <td className="px-4 py-3">
                                    <Badge tone={c.is_active ? 'success' : 'neutral'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                                </td>
                                <td className="px-4 py-3 text-right space-x-3">
                                    <Can permission="learning-materials.update">
                                        <Link href={route('admin.learning-material-categories.edit', c.id)} className="text-maroon underline">
                                            Edit
                                        </Link>
                                        {c.materials_count === 0 && (
                                            <button onClick={() => setDeleting(c)} className="text-red-700 underline">
                                                Delete
                                            </button>
                                        )}
                                    </Can>
                                </td>
                            </tr>
                        ))}
                        {categories.data.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-10 text-center text-stone-500">No categories found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination paginator={categories} />

            <ConfirmDialog
                open={deleting !== null}
                title="Delete category"
                description={deleting ? `Delete "${deleting.name}"? This cannot be undone.` : undefined}
                confirmLabel="Delete"
                variant="danger"
                processing={processing}
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </AdminLayout>
    );
}
