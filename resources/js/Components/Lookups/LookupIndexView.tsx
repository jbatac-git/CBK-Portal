import Badge from '@/Components/UI/Badge';
import { buttonClass } from '@/Components/UI/Button';
import Pagination from '@/Components/UI/Pagination';
import { Paginated } from '@/types/pagination';
import { LookupItem } from '@/types/lookup';
import { Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface LookupIndexViewProps {
    title: string;
    usageLabel: string; // e.g. "employee(s)" or "request(s)"
    items: Paginated<LookupItem>;
    filters: { search?: string };
    routePrefix: string;
}

export default function LookupIndexView({ title, usageLabel, items, filters, routePrefix }: LookupIndexViewProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route(`${routePrefix}.index`), search ? { search } : {}, { preserveState: true, replace: true });
    };

    const remove = (item: LookupItem) => {
        if (confirm(`Delete "${item.name}"?`)) {
            router.delete(route(`${routePrefix}.destroy`, item.id), { preserveScroll: true });
        }
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
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {items.data.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 font-medium text-stone-900">{item.name}</td>
                                <td className="px-4 py-3 text-stone-600">{item.usage_count} {usageLabel}</td>
                                <td className="px-4 py-3">
                                    <Badge tone={item.is_active ? 'success' : 'neutral'}>
                                        {item.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
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