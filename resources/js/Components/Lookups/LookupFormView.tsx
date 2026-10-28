import Input from '@/Components/UI/Input';
import { PanelForm, PanelHeader, PanelSection } from '@/Components/UI/SidePanel';
import Switch from '@/Components/UI/Switch';
import { whenSaved } from '@/Hooks/usePanel';
import { LookupItem } from '@/types/lookup';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface LookupFormViewProps {
    routePrefix: string;
    /** Singular, lower-case name of the list, e.g. "company". */
    noun: string;
    item?: Pick<LookupItem, 'id' | 'name' | 'is_active'>;
    onDone: () => void;
}

/** Add / edit form for a Maintenance list entry, shown in the side panel. */
export default function LookupFormView({ routePrefix, noun, item, onDone }: LookupFormViewProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: item?.name ?? '',
        is_active: item?.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: whenSaved(onDone) };

        if (item) {
            put(route(`${routePrefix}.update`, item.id), options);
        } else {
            post(route(`${routePrefix}.store`), options);
        }
    };

    return (
        <>
            <PanelHeader
                eyebrow={item ? `Edit ${noun}` : `Add ${noun}`}
                title={data.name.trim() || (item ? item.name : `New ${noun}`)}
                description={item ? undefined : `It can be picked in forms as soon as it is saved.`}
            />
            <PanelForm onSubmit={submit} onCancel={onDone} submitLabel={item ? 'Save changes' : `Add ${noun}`} processing={processing}>
                <PanelSection>
                    <Input
                        label="Name"
                        name="name"
                        autoComplete="off"
                        data-autofocus
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                    />

                    <div className="flex items-start justify-between gap-4 rounded-md border border-line bg-paper px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-ink">Active</p>
                            <p className="mt-0.5 text-[13px] text-stone-500">Inactive entries stay on existing records but can no longer be picked.</p>
                        </div>
                        <Switch id="is_active" label="Active" checked={data.is_active} onChange={(checked) => setData('is_active', checked)} />
                    </div>
                    {errors.is_active && <p className="text-[13px] text-red-700">{errors.is_active}</p>}
                </PanelSection>
            </PanelForm>
        </>
    );
}
