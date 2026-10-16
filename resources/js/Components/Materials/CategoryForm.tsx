import Button, { buttonClass } from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import { AdminCategory } from '@/types/material';
import { Link, useForm } from '@inertiajs/react';
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
        <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border border-stone-200 bg-white p-5">
            <Input label="Name" name="name" value={data.name}
                onChange={(e) => setData('name', e.target.value)} error={errors.name} />

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-stone-700">Description</label>
                <textarea
                    id="description"
                    rows={3}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-maroon focus:ring-maroon"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="rounded border-stone-300 text-maroon focus:ring-maroon" />
                <label htmlFor="is_active" className="text-sm text-stone-700">Active</label>
            </div>

            <div className="flex justify-end gap-3">
                <Link href={route('admin.learning-material-categories.index')} className={buttonClass('secondary')}>Cancel</Link>
                <Button type="submit" disabled={processing}>{category ? 'Save changes' : 'Add category'}</Button>
            </div>
        </form>
    );
}
