import { buttonClass } from '@/Components/UI/Button';
import Pagination from '@/Components/UI/Pagination';
import { Paginated } from '@/types/pagination';
import { LookupItem } from '@/types/lookup';
import { Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface LookupIndexViewProps {
    title: string;
    usageLabel: string;
    items: Paginated<LookupItem>;
    filters: { search?: string };
    routePrefix: string;
    /** Kasalukuyang Maintenance tab — kailangan para tama ang target ng search form. */
    tab: string;
}

export default function LookupIndexView({ title, usageLabel, items, filters, routePrefix, tab }: LookupIndexViewProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(
            route('admin.maintenance.index'),
            search ? { tab, search } : { tab },
            { preserveState: true, replace: true },
        );
    };

    const remove = (item: LookupItem) => {
        if (confirm(`Delete "${item.name}"?`)) {
            router.delete(route(`${routePrefix}.destroy`, item.id), { preserveScroll: true });
        }
    };

    const toggleActive = (item: LookupItem) => {
        setTogglingId(item.id);
        router.put(
            route(`${routePrefix}.update`, item.id),
            { name: item.name, is_active: !item.is_active },
            { preserveScroll: true, onFinish: () => setTogglingId(null) },
        );
    };

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <form onSubmit={applyFilters} className="flex items-center gap-2">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Search ${title.toLowerCase()}`}
                        className="w-56 rounded-md border-stone-300 text-sm shadow-sm focus:border-maroon focus:ring-maroon"
                    />
                    <button type="submit" className={buttonClass('secondary')}>Filter</button>
                </form>

                <Link href={route(`${routePrefix}.create`)} className={buttonClass('primary')}>
                    + Add {title.replace(/s$/, '')}
                </Link>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">In use</th>
                            <th className="px-4 py-3 font-medium">Active</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {items.data.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 font-medium text-stone-900">{item.name}</td>
                                <td className="px-4 py-3 text-stone-600">{item.usage_count} {usageLabel}</td>
                                <td className="px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => toggleActive(item)}
                                        disabled={togglingId === item.id}
                                        title={item.is_active ? 'Active — i-click para i-deactivate' : 'Inactive — i-click para i-activate'}
                                        className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${
                                            item.is_active ? 'bg-maroon' : 'bg-stone-300'
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                                                item.is_active ? 'left-5' : 'left-0.5'
                                            }`}
                                        />
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-right space-x-3">
                                    <Link href={route(`${routePrefix}.edit`, item.id)} className="text-maroon underline">
                                        Edit
                                    </Link>
                                    {item.usage_count === 0 && (
                                        <button onClick={() => remove(item)} className="text-red-700 underline">
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {items.data.length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-10 text-center text-stone-500">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4"><Pagination paginator={items} /></div>
        </div>
    );
}