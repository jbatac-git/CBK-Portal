import Button, { buttonClass } from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface PriceListFormProps {
    priceList?: { id: number; title: string; effective_date: string | null; status: string };
}

export default function PriceListForm({ priceList }: PriceListFormProps) {
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
            <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
                <Input label="Title" name="title" value={data.title}
                    onChange={(e) => setData('title', e.target.value)} error={errors.title} />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Effective date (optional)" name="effective_date" type="date"
                        value={data.effective_date} onChange={(e) => setData('effective_date', e.target.value)}
                        error={errors.effective_date} />

                    <Select label="Status" name="status" value={data.status}
                        onChange={(e) => setData('status', e.target.value)} error={errors.status}>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                    </Select>
                </div>

                <div>
                    <label htmlFor="file" className="block text-sm font-medium text-stone-700">
                        {priceList ? 'Replace file (optional, PDF)' : 'File (PDF)'}
                    </label>
                    <input id="file" type="file" accept=".pdf"
                        onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                        className="mt-1 block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-maroon file:px-3 file:py-1.5 file:text-white" />
                    {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
                </div>
            </section>

            <div className="flex justify-end gap-3">
                <Link href={route('admin.price-lists.index')} className={buttonClass('secondary')}>Cancel</Link>
                <Button type="submit" disabled={processing}>{priceList ? 'Save changes' : 'Upload'}</Button>
            </div>
        </form>
    );
}