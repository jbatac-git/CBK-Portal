import Can from '@/Components/Shared/Can';
import Badge, { BadgeTone } from '@/Components/UI/Badge';
import Button, { buttonClass } from '@/Components/UI/Button';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import PageHeader from '@/Components/UI/PageHeader';
import Pagination from '@/Components/UI/Pagination';
import IconButton from '@/Components/UI/IconButton';
import Menu from '@/Components/UI/Menu';
import Table, { EmptyRow, RowActions, TBody, Td, Th, THead, Tr } from '@/Components/UI/Table';
import Toolbar, { FilterSelect, SearchInput } from '@/Components/UI/Toolbar';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminMaterial, Category } from '@/types/material';
import { Paginated } from '@/types/pagination';
import { Option } from '@/types/user';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, FileText, Pencil, PlayCircle, Plus } from 'lucide-react';
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
    const [archiving, setArchiving] = useState<AdminMaterial | null>(null);
    const [processing, setProcessing] = useState(false);

    const hasFilters = Boolean(filters.search || filters.status || filters.category);

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;
        if (category) params.category = category;
        router.get(route('admin.learning-materials.index'), params, { preserveState: true, replace: true });
    };

    const confirmArchive = () => {
        if (!archiving) return;

        router.post(
            route('admin.learning-materials.archive', archiving.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    setArchiving(null);
                },
            },
        );
    };

    return (
        <AdminLayout title="Learning materials">
            <Head title="Learning materials" />

            <PageHeader
                title="Learning materials"
                description="PDFs and training videos that Disers can open in CBK Academy."
                actions={
                    <>
                        <Link href={route('admin.learning-material-categories.index')} className={buttonClass('secondary')}>
                            Categories
                        </Link>
                        <Can permission="learning-materials.create">
                            <Link href={route('admin.learning-materials.create')} className={buttonClass('primary')}>
                                <Plus aria-hidden="true" />
                                Add material
                            </Link>
                        </Can>
                    </>
                }
            />

            <Toolbar onSubmit={applyFilters}>
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title" />
                <FilterSelect value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
                    <option value="">All statuses</option>
                    {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </FilterSelect>
                <FilterSelect value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
                    <option value="">All categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </FilterSelect>
                <Button type="submit" variant="secondary">
                    Filter
                </Button>
            </Toolbar>

            <Table footer={<Pagination paginator={materials} />}>
                <THead>
                    <Th>Title</Th>
                    <Th>Category</Th>
                    <Th>Type</Th>
                    <Th align="right">Size</Th>
                    <Th>Status</Th>
                    <Th align="right">
                        <span className="sr-only">Actions</span>
                    </Th>
                </THead>
                <TBody>
                    {materials.data.map((m) => {
                        const TypeIcon = m.type === 'video' ? PlayCircle : FileText;

                        return (
                            <Tr key={m.id}>
                                <Td className="max-w-md">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium text-ink">{m.title}</span>
                                        {m.available_during_temporary && (
                                            <span
                                                className="inline-flex items-center rounded border border-gold-200 bg-gold-50 px-1.5 py-px text-2xs font-medium text-gold-700"
                                                title="Available during the 7-day temporary access period"
                                            >
                                                Temp access
                                            </span>
                                        )}
                                    </div>
                                    {m.description && (
                                        <p className="mt-0.5 line-clamp-1 text-[13px] text-stone-500" title={m.description}>
                                            {m.description}
                                        </p>
                                    )}
                                </Td>
                                <Td>{m.category ?? <span className="text-stone-400">—</span>}</Td>
                                <Td>
                                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                        <TypeIcon className="h-4 w-4 text-stone-400" aria-hidden="true" />
                                        {m.type_label}
                                    </span>
                                </Td>
                                <Td align="right" className="whitespace-nowrap font-mono text-[13px] text-stone-600">
                                    {m.file_size_label}
                                </Td>
                                <Td>
                                    <Badge tone={statusTones[m.status]}>{m.status_label}</Badge>
                                </Td>
                                <Td align="right">
                                    <RowActions>
                                        {m.can_update && <IconButton icon={Pencil} label="Edit" href={route('admin.learning-materials.edit', m.id)} />}
                                        <Menu
                                            label={`More actions for ${m.title}`}
                                            items={m.can_archive && m.status !== 'archived' ? [{ label: 'Archive', onSelect: () => setArchiving(m), danger: true }] : []}
                                        />
                                    </RowActions>
                                </Td>
                            </Tr>
                        );
                    })}
                    {materials.data.length === 0 && (
                        <EmptyRow
                            colSpan={6}
                            icon={BookOpen}
                            title={hasFilters ? 'No materials match these filters' : 'No learning materials yet'}
                            hint={
                                hasFilters
                                    ? 'Try a different search term, status or category.'
                                    : 'Upload a PDF or training video to share it with Disers.'
                            }
                        />
                    )}
                </TBody>
            </Table>

            <ConfirmDialog
                open={archiving !== null}
                title="Archive material"
                description={
                    archiving ? `"${archiving.title}" will no longer be visible to Disers.` : undefined
                }
                confirmLabel="Archive"
                variant="danger"
                processing={processing}
                onConfirm={confirmArchive}
                onCancel={() => setArchiving(null)}
            />
        </AdminLayout>
    );
}
