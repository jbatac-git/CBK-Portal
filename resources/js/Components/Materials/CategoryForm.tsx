import FormActions from '@/Components/UI/FormActions';
import Card, { CardBody, CardHeader } from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import Switch from '@/Components/UI/Switch';
import Textarea from '@/Components/UI/Textarea';
import { AdminCategory } from '@/types/material';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface CategoryFormProps {
    category?: Pick<AdminCategory, 'id' | 'name' | 'description' | 'is_active'>;
}

export default function CategoryForm({ category }: CategoryFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
        is_active: category?.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (category) {
            put(route('admin.learning-material-categories.update', category.id));
        } else {
            post(route('admin.learning-material-categories.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <Card>
                <CardHeader title="Category details" />
                <CardBody className="space-y-5">
                    <Input
                        label="Name"
                        name="name"
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
                </CardBody>
            </Card>
            <FormActions cancelHref={route('admin.learning-material-categories.index')} submitLabel={category ? 'Save changes' : 'Add category'} processing={processing} />
        </form>
    );
}
