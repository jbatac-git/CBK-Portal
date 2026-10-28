import FileDropzone from '@/Components/Materials/FileDropzone';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import { PanelForm, PanelHeader, PanelSection } from '@/Components/UI/SidePanel';
import { whenSaved } from '@/Hooks/usePanel';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export interface EditablePriceList {
    id: number;
    title: string;
    effective_date: string | null;
    status: string;
    file_type: 'pdf' | 'xlsx';
}

interface PriceListFormProps {
    priceList?: EditablePriceList;
    maxFileMb: number;
    onDone: () => void;
}

/** Add / edit a price list in the side panel. */
export default function PriceListForm({ priceList, maxFileMb, onDone }: PriceListFormProps) {
    const { data, setData, post, processing, progress, errors } = useForm({
        title: priceList?.title ?? '',
        effective_date: priceList?.effective_date ?? '',
        status: priceList?.status ?? 'active',
        file: null as File | null,
        _method: priceList ? 'put' : 'post',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(priceList ? route('admin.price-lists.update', priceList.id) : route('admin.price-lists.store'), {
            preserveScroll: true,
            onSuccess: whenSaved(onDone),
        });
    };

    return (
        <>
            <PanelHeader
                eyebrow={priceList ? 'Edit price list' : 'Add price list'}
                title={data.title.trim() || (priceList ? priceList.title : 'New price list')}
                description={priceList ? undefined : 'Share a PDF or Excel price list with Disers.'}
            />
            <PanelForm
                onSubmit={submit}
                onCancel={onDone}
                submitLabel={priceList ? 'Save changes' : 'Add price list'}
                processing={processing}
                note={progress ? <span className="tabular">Uploading… {progress.percentage}%</span> : undefined}
            >
                <PanelSection title="Details">
                    <Input
                        label="Title"
                        name="title"
                        data-autofocus
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        error={errors.title}
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                            label="Effective date"
                            name="effective_date"
                            type="date"
                            optional
                            value={data.effective_date}
                            onChange={(e) => setData('effective_date', e.target.value)}
                            error={errors.effective_date}
                        />

                        <Select
                            label="Status"
                            name="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            error={errors.status}
                        >
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </Select>
                    </div>
                </PanelSection>

                <PanelSection
                    title="File"
                    description={
                        priceList
                            ? `Currently ${priceList.file_type === 'xlsx' ? 'an Excel workbook' : 'a PDF'}. Excel downloads are stamped with the downloader's name.`
                            : "Excel downloads are stamped with the downloader's name."
                    }
                >
                    <FileDropzone
                        id="file"
                        label={priceList ? 'Replace file' : 'File'}
                        optional={Boolean(priceList)}
                        file={data.file}
                        onChange={(file) => setData('file', file)}
                        accept=".pdf,.xlsx"
                        typesLabel="PDF or Excel (.xlsx)"
                        maxMb={maxFileMb}
                        error={errors.file}
                        hint={priceList ? 'Leave empty to keep the current file.' : undefined}
                    />
                </PanelSection>
            </PanelForm>
        </>
    );
}
