import Button from '@/Components/UI/Button';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import Pagination from '@/Components/UI/Pagination';
import Badge from '@/Components/UI/Badge';
import IconButton from '@/Components/UI/IconButton';
import Menu from '@/Components/UI/Menu';
import Table, { EmptyRow, RowActions, TBody, Td, Th, THead, Tr } from '@/Components/UI/Table';
import Toolbar, { SearchInput } from '@/Components/UI/Toolbar';
import { LookupItem } from '@/types/lookup';
import { Paginated } from '@/types/pagination';
import { router } from '@inertiajs/react';
import { ListChecks, Pencil } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface LookupIndexViewProps {
    title: string;
    usageLabel: string;
    items: Paginated<LookupItem>;
    filters: { search?: string };
    routePrefix: string;
    /** Current Maintenance tab, needed so the search form targets the right list. */
    tab: string;
    /** Opens the entry in the side panel. */
    onEdit: (item: LookupItem) => void;
}

/** "Removal Reasons" becomes "Removal reasons". */
export function sentenceCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/** "Companies" becomes "company", "Removal Reasons" becomes "removal reason". */
export function singular(value: string): string {
    const lower = value.toLowerCase();
    if (lower.endsWith('ies')) return `${lower.slice(0, -3)}y`;
    if (lower.endsWith('s')) return lower.slice(0, -1);
    return lower;
}

/** Resolves server labels like "employee(s)" against a count. */
function usage(count: number, label: string): string {
    return `${count} ${label.replace('(s)', count === 1 ? '' : 's')}`;
}

export default function LookupIndexView({ title, usageLabel, items, filters, routePrefix, tab, onEdit }: LookupIndexViewProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleting, setDeleting] = useState<LookupItem | null>(null);
    const [processing, setProcessing] = useState(false);

    const noun = singular(title);
    const plural = title.toLowerCase();

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('admin.maintenance.index'), search ? { tab, search } : { tab }, { preserveState: true, replace: true });
    };

    const confirmDelete = () => {
        if (!deleting) return;

        router.delete(route(`${routePrefix}.destroy`, deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const toggleActive = (item: LookupItem) => {
        router.put(
            route(`${routePrefix}.update`, item.id),
            { name: item.name, is_active: !item.is_active },
            { preserveScroll: true },
        );
    };

    return (
        <div>
            <Toolbar onSubmit={applyFilters}>
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${plural}`} />
                <Button type="submit" variant="secondary">
                    Filter
                </Button>
            </Toolbar>

            <Table footer={<Pagination paginator={items} />}>
                <THead>
                    <Th>Name</Th>
                    <Th>In use</Th>
                    <Th>Status</Th>
                    <Th align="right">
                        <span className="sr-only">Actions</span>
                    </Th>
                </THead>
                <TBody>
                    {items.data.map((item) => (
                        <Tr key={item.id} onOpen={() => onEdit(item)}>
                            <Td>
                                <span className={`font-medium ${item.is_active ? 'text-ink' : 'text-stone-500'}`}>{item.name}</span>
                            </Td>
                            <Td className="tabular whitespace-nowrap">
                                {item.usage_count === 0 ? <span className="text-stone-400">Not in use</span> : usage(item.usage_count, usageLabel)}
                            </Td>
                            <Td>
                                <Badge tone={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
                            </Td>
                            <Td align="right">
                                <RowActions>
                                    <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(item)} />
                                    <Menu
                                        label={`More actions for ${item.name}`}
                                        items={[
                                            { label: item.is_active ? 'Deactivate' : 'Activate', onSelect: () => toggleActive(item) },
                                            ...(item.usage_count === 0
                                                ? [{ label: 'Delete', onSelect: () => setDeleting(item), danger: true, separated: true }]
                                                : []),
                                        ]}
                                    />
                                </RowActions>
                            </Td>
                        </Tr>
                    ))}
                    {items.data.length === 0 && (
                        <EmptyRow
                            colSpan={4}
                            icon={ListChecks}
                            title={filters.search ? `No ${plural} match your search` : `No ${plural} yet`}
                            hint={filters.search ? 'Try a different search term.' : `Add a ${noun} so it can be picked in forms.`}
                        />
                    )}
                </TBody>
            </Table>

            <ConfirmDialog
                open={deleting !== null}
                title={`Delete ${noun}`}
                description={deleting ? `Delete "${deleting.name}"? This cannot be undone.` : undefined}
                confirmLabel="Delete"
                variant="danger"
                processing={processing}
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}
