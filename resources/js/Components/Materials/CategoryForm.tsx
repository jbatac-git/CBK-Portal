import Input from '@/Components/UI/Input';
import { PanelForm, PanelHeader, PanelSection } from '@/Components/UI/SidePanel';
import Switch from '@/Components/UI/Switch';
import Textarea from '@/Components/UI/Textarea';
import { whenSaved } from '@/Hooks/usePanel';
import { AdminCategory } from '@/types/material';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface CategoryFormProps {
    category?: Pick<AdminCategory, 'id' | 'name' | 'description' | 'is_active'>;
    onDone: () => void;
}

/** Add / edit a learning material category in the side panel. */
export default function CategoryForm({ category, onDone }: CategoryFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
        is_active: category?.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: whenSaved(onDone) };

        if (category) {
            put(route('admin.learning-material-categories.update', category.id), options);
        } else {
            post(route('admin.learning-material-categories.store'), options);
        }
    };

    return (
        <>
            <PanelHeader
                eyebrow={category ? 'Edit category' : 'Add category'}
                title={data.name.trim() || (category ? category.name : 'New category')}
                description={category ? undefined : 'Groups that organise learning materials in the Diser library.'}
            />
            <PanelForm onSubmit={submit} onCancel={onDone} submitLabel={category ? 'Save changes' : 'Add category'} processing={processing}>
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

                    <Textarea
                        label="Description"
                        name="description"
                        optional
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                    />

                    <div className="flex items-start justify-between gap-4 rounded-md border border-line bg-paper px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-ink">Active</p>
                            <p className="mt-0.5 text-[13px] text-stone-500">Inactive categories are hidden when uploading new materials.</p>
                        </div>
                        <Switch id="is_active" label="Active" checked={data.is_active} onChange={(checked) => setData('is_active', checked)} />
                    </div>
                    {errors.is_active && <p className="text-[13px] text-red-700">{errors.is_active}</p>}
                </PanelSection>
            </PanelForm>
        </>
    );
}
