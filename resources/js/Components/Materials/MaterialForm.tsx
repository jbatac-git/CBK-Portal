import Button, { buttonClass } from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import { AdminMaterial, MaterialFormOptions } from '@/types/material';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface MaterialFormProps {
    options: MaterialFormOptions;
    material?: AdminMaterial;
}

export default function MaterialForm({ options, material }: MaterialFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        learning_material_category_id: material ? String(material.learning_material_category_id) : '',
        title: material?.title ?? '',
        description: material?.description ?? '',
        type: material?.type ?? 'pdf',
        status: material?.status ?? 'draft',
        available_during_temporary: material?.available_during_temporary ?? false,
        sort_order: material?.sort_order ?? 0,
        file: null as File | null,
        _method: material ? 'put' : 'post',
    });

    const maxMb = data.type === 'video' ? options.max_video_mb : options.max_pdf_mb;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // A file input needs multipart/form-data: Inertia's useForm switches
        // to that automatically whenever any field in `data` is a File.
        post(material ? route('admin.learning-materials.update', material.id) : route('admin.learning-materials.store'));
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
                <Input label="Title" name="title" value={data.title}
                    onChange={(e) => setData('title', e.target.value)} error={errors.title} />

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-stone-700">Description (optional)</label>
                    <textarea id="description" rows={3} value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-maroon focus:ring-maroon" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Select label="Category" name="learning_material_category_id" value={data.learning_material_category_id}
                        onChange={(e) => setData('learning_material_category_id', e.target.value)} error={errors.learning_material_category_id}>
                        <option value="">Select a category</option>
                        {options.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>

                    <Select label="Status" name="status" value={data.status}
                        onChange={(e) =>
                            setData(
                                'status',
                                e.target.value as 'draft' | 'published' | 'archived'
                            )
                        } error={errors.status}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </Select>
                </div>

                {!material && (
                    <Select label="Material type" name="type" value={data.type}
                        onChange={(e) =>
                            setData(
                                'type',
                                e.target.value as 'pdf' | 'video'
                            )
                        } error={errors.type}>
                        <option value="pdf">PDF document</option>
                        <option value="video">Training video</option>
                    </Select>
                )}

                <div>
                    <label htmlFor="file" className="block text-sm font-medium text-stone-700">
                        {material ? `Replace file (optional, max ${maxMb} MB)` : `File (max ${maxMb} MB)`}
                    </label>
                    <input
                        id="file"
                        type="file"
                        accept={data.type === 'video' ? '.mp4,.mov,.webm' : '.pdf'}
                        onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                        className="mt-1 block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-maroon file:px-3 file:py-1.5 file:text-white"
                    />
                    {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="available_during_temporary"
                        checked={data.available_during_temporary}
                        onChange={(e) => setData('available_during_temporary', e.target.checked)}
                        className="rounded border-stone-300 text-maroon focus:ring-maroon" />
                    <label htmlFor="available_during_temporary" className="text-sm text-stone-700">
                        Available during the 7-day temporary access period
                    </label>
                </div>

                <Input label="Sort order" name="sort_order" type="number" min={0} value={data.sort_order}
                    onChange={(e) => setData('sort_order', Number(e.target.value))} error={errors.sort_order} />
            </section>

            <div className="flex justify-end gap-3">
                <Link href={route('admin.learning-materials.index')} className={buttonClass('secondary')}>Cancel</Link>
                <Button type="submit" disabled={processing}>{material ? 'Save changes' : 'Upload material'}</Button>
            </div>
        </form>
    );
}