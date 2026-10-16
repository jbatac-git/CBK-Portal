import FormActions from '@/Components/UI/FormActions';
import Card, { CardBody } from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import Switch from '@/Components/UI/Switch';
import { LookupItem } from '@/types/lookup';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface LookupFormViewProps {
    routePrefix: string;
    backHref: string;
    item?: Pick<LookupItem, 'id' | 'name' | 'is_active'>;
    /** Label for the create button, e.g. "Add company". */
    submitLabel?: string;
}

export default function LookupFormView({ routePrefix, backHref, item, submitLabel = 'Add' }: LookupFormViewProps) {
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
        <form onSubmit={submit} className="space-y-6">
            <Card>
                <CardBody className="space-y-5">
                    <Input label="Name" name="name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} />

                    <div className="flex items-start justify-between gap-4 rounded-md border border-line bg-paper px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-ink">Active</p>
                            <p className="mt-0.5 text-[13px] text-stone-500">Inactive entries stay on existing records but can no longer be picked.</p>
                        </div>
                        <Switch id="is_active" label="Active" checked={data.is_active} onChange={(checked) => setData('is_active', checked)} />
                    </div>
                    {errors.is_active && <p className="text-[13px] text-red-700">{errors.is_active}</p>}
                </CardBody>
            </Card>
            <FormActions cancelHref={backHref} submitLabel={item ? 'Save changes' : submitLabel} processing={processing} />
        </form>
    );
}
