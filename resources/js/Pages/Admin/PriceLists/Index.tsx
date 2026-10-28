import PriceListForm from '@/Components/PriceLists/PriceListForm';
import Can from '@/Components/Shared/Can';
import Badge, { BadgeTone } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import PageHeader from '@/Components/UI/PageHeader';
import Pagination from '@/Components/UI/Pagination';
import IconButton from '@/Components/UI/IconButton';
import Menu from '@/Components/UI/Menu';
import SidePanel from '@/Components/UI/SidePanel';
import Table, { EmptyRow, RowActions, TBody, Td, Th, THead, Tr } from '@/Components/UI/Table';
import Toolbar, { FilterSelect, SearchInput } from '@/Components/UI/Toolbar';
import { usePanel } from '@/Hooks/usePanel';
import AdminLayout from '@/Layouts/AdminLayout';
import { Paginated } from '@/types/pagination';
import { Option } from '@/types/user';
import { Head, router } from '@inertiajs/react';
import { Download, ExternalLink, FileSpreadsheet, FileText, Pencil, Plus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface PriceListRow {
    id: number;
    title: string;
    effective_date: string | null;
    status: string;
    status_label: string;
    file_url: string;
    file_type: 'pdf' | 'xlsx';
    uploaded_by: string | null;
    can_update: boolean;
    can_archive: boolean;
}

interface IndexProps {
    priceLists: Paginated<PriceListRow>;
    filters: { search?: string; status?: string };
    statuses: Option[];
    maxFileMb: number;
}

const tones: Record<string, BadgeTone> = { active: 'success', archived: 'neutral' };

const dateFormat = new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

/** Formats a server `YYYY-MM-DD` date without shifting it across time zones. */
function formatDate(value: string): string {
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return value;
    return dateFormat.format(new Date(y, m - 1, d));
}

export default function Index({ priceLists, filters, statuses, maxFileMb }: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [archiving, setArchiving] = useState<PriceListRow | null>(null);
    const [processing, setProcessing] = useState(false);
    const panel = usePanel<{ priceList: PriceListRow | null }>();

    const hasFilters = Boolean(filters.search || filters.status);

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;
        router.get(route('admin.price-lists.index'), params, { preserveState: true, replace: true });
    };

    const confirmArchive = () => {
        if (!archiving) return;

        router.post(
            route('admin.price-lists.archive', archiving.id),
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
        <AdminLayout title="Price lists">
            <Head title="Price lists" />

            <PageHeader
                title="Price lists"
                description="PDF and Excel price lists that Disers can open in CBK Academy. Every Excel download is stamped with the downloader's name."
                actions={
                    <Can permission="price-lists.create">
                        <Button onClick={() => panel.show({ priceList: null })}>
                            <Plus aria-hidden="true" />
                            Add price list
                        </Button>
                    </Can>
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
                <Button type="submit" variant="secondary">
                    Filter
                </Button>
            </Toolbar>

            <Table footer={<Pagination paginator={priceLists} />}>
                <THead>
                    <Th>Title</Th>
                    <Th>Effective date</Th>
                    <Th>Status</Th>
                    <Th>File</Th>
                    <Th align="right">
                        <span className="sr-only">Actions</span>
                    </Th>
                </THead>
                <TBody>
                    {priceLists.data.map((row) => (
                        <Tr key={row.id} onOpen={row.can_update ? () => panel.show({ priceList: row }) : undefined}>
                            <Td>
                                <p className="font-medium text-ink">{row.title}</p>
                                <p className="mt-0.5 text-[13px] text-stone-500">
                                    {row.uploaded_by ? `Uploaded by ${row.uploaded_by}` : 'Uploader unknown'}
                                </p>
                            </Td>
                            <Td className="tabular whitespace-nowrap">
                                {row.effective_date ? (
                                    <time dateTime={row.effective_date}>{formatDate(row.effective_date)}</time>
                                ) : (
                                    <span className="text-stone-400">Not set</span>
                                )}
                            </Td>
                            <Td>
                                <Badge tone={tones[row.status] ?? 'neutral'}>{row.status_label}</Badge>
                            </Td>
                            <Td>
                                {row.file_type === 'xlsx' ? (
                                    <a
                                        href={row.file_url}
                                        onClick={(e) => e.stopPropagation()}
                                        download
                                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-maroon-700 hover:text-maroon-900"
                                    >
                                        <FileSpreadsheet className="h-4 w-4 text-stone-400" aria-hidden="true" />
                                        Download Excel
                                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                        <span className="sr-only">for {row.title} (stamped with your name)</span>
                                    </a>
                                ) : (
                                    <a
                                        href={row.file_url}
                                        onClick={(e) => e.stopPropagation()}
                                        target="_blank"
                                        rel="noopener"
                                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-maroon-700 hover:text-maroon-900"
                                    >
                                        <FileText className="h-4 w-4 text-stone-400" aria-hidden="true" />
                                        Open PDF
                                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                        <span className="sr-only">for {row.title} (opens in a new tab)</span>
                                    </a>
                                )}
                            </Td>
                            <Td align="right">
                                <RowActions>
                                    {row.can_update && <IconButton icon={Pencil} label="Edit" onClick={() => panel.show({ priceList: row })} />}
                                    <Menu
                                        label={`More actions for ${row.title}`}
                                        items={row.can_archive ? [{ label: 'Archive', onSelect: () => setArchiving(row), danger: true }] : []}
                                    />
                                </RowActions>
                            </Td>
                        </Tr>
                    ))}
                    {priceLists.data.length === 0 && (
                        <EmptyRow
                            colSpan={5}
                            icon={FileText}
                            title={hasFilters ? 'No price lists match these filters' : 'No price lists yet'}
                            hint={hasFilters ? 'Try a different search term or status.' : 'Upload a PDF or Excel file to share it with Disers.'}
                        />
                    )}
                </TBody>
            </Table>

            <SidePanel open={panel.open} onClose={panel.close}>
                {panel.data && (
                    <PriceListForm key={panel.key} priceList={panel.data.priceList ?? undefined} maxFileMb={maxFileMb} onDone={panel.close} />
                )}
            </SidePanel>

            <ConfirmDialog
                open={archiving !== null}
                title="Archive price list"
                description={archiving ? `"${archiving.title}" will no longer be visible to Disers.` : undefined}
                confirmLabel="Archive"
                variant="danger"
                processing={processing}
                onConfirm={confirmArchive}
                onCancel={() => setArchiving(null)}
            />
        </AdminLayout>
    );
}
