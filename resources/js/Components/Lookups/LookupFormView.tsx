import Button, { buttonClass } from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import { LookupItem } from '@/types/lookup';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface LookupFormViewProps {
    routePrefix: string;
    backHref: string;
    item?: Pick<LookupItem, 'id' | 'name' | 'is_active'>;
}

export default function LookupFormView({ routePrefix, backHref, item }: LookupFormViewProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: item?.name ?? '',
        is_active: item?.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (item) {
            put(route(`${routePrefix}.update`, item.id));
        } else {
            post(route(`${routePrefix}.store`));
        }
    };

    return (
        <form onSubmit={submit} className="max-w-md space-y-4 rounded-xl border border-stone-200 bg-white p-5">
            <Input label="Name" name="name" value={data.name}
                onChange={(e) => setData('name', e.target.value)} error={errors.name} />

            <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="rounded border-stone-300 text-maroon focus:ring-maroon" />
                <label htmlFor="is_active" className="text-sm text-stone-700">Active</label>
            </div>

            <div className="flex justify-end gap-3">
                <Link href={backHref} className={buttonClass('secondary')}>Cancel</Link>
                <Button type="submit" disabled={processing}>{item ? 'Save changes' : 'Add'}</Button>
            </div>
        </form>
    );
}