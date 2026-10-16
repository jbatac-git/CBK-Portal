import MaterialsGrid from '@/Components/Materials/MaterialsGrid';
import Button from '@/Components/UI/Button';
import EmptyState from '@/Components/UI/EmptyState';
import PageHeader from '@/Components/UI/PageHeader';
import { SearchInput } from '@/Components/UI/Toolbar';
import { usePermission } from '@/Hooks/usePermission';
import DiserLayout from '@/Layouts/DiserLayout';
import { PortalMaterial } from '@/types/material';
import { Head } from '@inertiajs/react';
import { SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';

const ALL = '__all__';
const UNCATEGORIZED = 'Uncategorized';

export default function Index({ materials }: { materials: PortalMaterial[] }) {
    const { user } = usePermission();
    const [category, setCategory] = useState<string>(ALL);
    const [search, setSearch] = useState('');

    const categories = useMemo(() => {
        const counts = new Map<string, number>();
        materials.forEach((m) => {
            const name = m.category ?? UNCATEGORIZED;
            counts.set(name, (counts.get(name) ?? 0) + 1);
        });
        return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
    }, [materials]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return materials.filter((m) => {
            if (category !== ALL && (m.category ?? UNCATEGORIZED) !== category) return false;
            if (!term) return true;
            return [m.title, m.description ?? '', m.category ?? ''].some((value) => value.toLowerCase().includes(term));
        });
    }, [materials, category, search]);

    const lockedCount = materials.filter((m) => m.locked).length;
    const isFiltering = category !== ALL || search.trim() !== '';

    const chip = (value: string, label: string, count: number) => {
        const selected = category === value;
        return (
            <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(value)}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-maroon-500/40 ${
                    selected
                        ? 'border-ink bg-ink text-white'
                        : 'border-line bg-white text-stone-600 hover:border-stone-300 hover:text-ink'
                }`}
            >
                {label}
                <span className={`tabular text-2xs ${selected ? 'text-white/60' : 'text-stone-400'}`}>{count}</span>
            </button>
        );
    };

    return (
        <DiserLayout>
            <Head title="Learning" />

            <PageHeader
                eyebrow="Learning"
                title="Learning library"
                description="Product guides and training videos to help you on the floor."
            />

            {user.is_temporary && lockedCount > 0 && (
                <p className="mb-5 rounded-lg border border-gold-200 bg-gold-50 px-4 py-3 text-[13px] leading-relaxed text-gold-700">
                    <span className="font-semibold">
                        {lockedCount} {lockedCount === 1 ? 'material is' : 'materials are'} locked.
                    </span>{' '}
                    You can open the starter materials now. The rest unlock once your account is approved.
                </p>
            )}

            {materials.length > 0 && (
                <div className="mb-5 space-y-3">
                    <div role="search">
                        <SearchInput
                            placeholder="Search materials"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {categories.length > 1 && (
                        <div
                            role="group"
                            aria-label="Filter by category"
                            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
                        >
                            {chip(ALL, 'All', materials.length)}
                            {categories.map(([name, count]) => chip(name, name, count))}
                        </div>
                    )}
                </div>
            )}

            <MaterialsGrid
                materials={filtered}
                empty={
                    isFiltering ? (
                        <EmptyState
                            icon={SearchX}
                            title="No materials match your filters"
                            description="Try a different search term or category."
                            action={
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setSearch('');
                                        setCategory(ALL);
                                    }}
                                >
                                    Clear filters
                                </Button>
                            }
                        />
                    ) : undefined
                }
            />
        </DiserLayout>
    );
}
