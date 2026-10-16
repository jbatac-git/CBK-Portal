import FileDropzone from '@/Components/Materials/FileDropzone';
import FormActions from '@/Components/UI/FormActions';
import Card, { CardBody, CardHeader } from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export interface EditablePriceList {
    id: number;
    title: string;
    effective_date: string | null;
    status: string;
}

interface PriceListFormProps {
    priceList?: EditablePriceList;
    maxFileMb: number;
}

export default function PriceListForm({ priceList, maxFileMb }: PriceListFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: priceList?.title ?? '',
        effective_date: priceList?.effective_date ?? '',
        status: priceList?.status ?? 'active',
        file: null as File | null,
        _method: priceList ? 'put' : 'post',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(priceList ? route('admin.price-lists.update', priceList.id) : route('admin.price-lists.store'));
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <Card>
                <CardHeader title="Price list details" />
                <CardBody className="space-y-5">
                    <Input
                        label="Title"
                        name="title"
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

                    <FileDropzone
                        id="file"
                        label={priceList ? 'Replace file' : 'File'}
                        optional={Boolean(priceList)}
                        file={data.file}
                        onChange={(file) => setData('file', file)}
                        accept=".pdf"
                        typesLabel="PDF"
                        maxMb={maxFileMb}
                        error={errors.file}
                        hint={priceList ? 'Leave empty to keep the current file.' : undefined}
                    />
                </CardBody>
            </Card>
            <FormActions cancelHref={route('admin.price-lists.index')} submitLabel={priceList ? 'Save changes' : 'Add price list'} processing={processing} />
        </form>
    );
}
