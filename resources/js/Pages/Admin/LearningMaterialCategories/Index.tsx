import Can from '@/Components/Shared/Can';
import Badge from '@/Components/UI/Badge';
import Button, { buttonClass } from '@/Components/UI/Button';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import PageHeader from '@/Components/UI/PageHeader';
import Pagination from '@/Components/UI/Pagination';
import IconButton from '@/Components/UI/IconButton';
import Menu from '@/Components/UI/Menu';
import Table, { EmptyRow, RowActions, TBody, Td, Th, THead, Tr } from '@/Components/UI/Table';
import Toolbar, { SearchInput } from '@/Components/UI/Toolbar';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminCategory } from '@/types/material';
import { Paginated } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { FolderTree, Pencil, Plus } from 'lucide-react';
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
        router.get(route('admin.learning-material-categories.index'), search ? { search } : {}, { preserveState: true, replace: true });
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
        <AdminLayout title="Categories">
            <Head title="Learning material categories" />

            <PageHeader
                back={{ href: route('admin.learning-materials.index'), label: 'Learning materials' }}
                title="Categories"
                description="Groups that organise learning materials in the Diser library."
                actions={
                    <Can permission="learning-materials.create">
                        <Link href={route('admin.learning-material-categories.create')} className={buttonClass('primary')}>
                            <Plus aria-hidden="true" />
                            Add category
                        </Link>
                    </Can>
                }
            />

            <Toolbar onSubmit={applyFilters}>
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories" />
                <Button type="submit" variant="secondary">
                    Filter
                </Button>
            </Toolbar>

            <Table footer={<Pagination paginator={categories} />}>
                <THead>
                    <Th>Name</Th>
                    <Th align="right">Materials</Th>
                    <Th>Status</Th>
                    <Th align="right">
                        <span className="sr-only">Actions</span>
                    </Th>
                </THead>
                <TBody>
                    {categories.data.map((c) => (
                        <Tr key={c.id}>
                            <Td className="max-w-md">
                                <p className="font-medium text-ink">{c.name}</p>
                                {c.description && (
                                    <p className="mt-0.5 line-clamp-1 text-[13px] text-stone-500" title={c.description}>
                                        {c.description}
                                    </p>
                                )}
                            </Td>
                            <Td align="right" className="tabular">
                                {c.materials_count}
                            </Td>
                            <Td>
                                <Badge tone={c.is_active ? 'success' : 'neutral'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                            </Td>
                            <Td align="right">
                                <Can permission="learning-materials.update">
                                    <RowActions>
                                        <IconButton icon={Pencil} label="Edit" href={route('admin.learning-material-categories.edit', c.id)} />
                                        <Menu
                                            label={`More actions for ${c.name}`}
                                            items={c.materials_count === 0 ? [{ label: 'Delete', onSelect: () => setDeleting(c), danger: true }] : []}
                                        />
                                    </RowActions>
                                </Can>
                            </Td>
                        </Tr>
                    ))}
                    {categories.data.length === 0 && (
                        <EmptyRow
                            colSpan={4}
                            icon={FolderTree}
                            title={filters.search ? 'No categories match your search' : 'No categories yet'}
                            hint={filters.search ? 'Try a different search term.' : 'Add a category before uploading learning materials.'}
                        />
                    )}
                </TBody>
            </Table>

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
