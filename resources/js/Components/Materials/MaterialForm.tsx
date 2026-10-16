import FileDropzone from '@/Components/Materials/FileDropzone';
import Button, { buttonClass } from '@/Components/UI/Button';
import Card, { CardBody, CardFooter, CardHeader } from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Textarea from '@/Components/UI/Textarea';
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

    const isVideo = data.type === 'video';
    const maxMb = isVideo ? options.max_video_mb : options.max_pdf_mb;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // A file input needs multipart/form-data: Inertia's useForm switches
        // to that automatically whenever any field in `data` is a File.
        post(material ? route('admin.learning-materials.update', material.id) : route('admin.learning-materials.store'));
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <Card>
                <CardHeader title="Details" description="What Disers see in the learning library." />
                <CardBody className="space-y-5">
                    <Input
                        label="Title"
                        name="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        error={errors.title}
                    />

                    <Textarea
                        label="Description"
                        name="description"
                        optional
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Select
                            label="Category"
                            name="learning_material_category_id"
                            value={data.learning_material_category_id}
                            onChange={(e) => setData('learning_material_category_id', e.target.value)}
                            error={errors.learning_material_category_id}
                        >
                            <option value="">Select a category</option>
                            {options.categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Status"
                            name="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as 'draft' | 'published' | 'archived')}
                            error={errors.status}
                            hint="Only published materials are visible to Disers."
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </Select>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader
                    title="File"
                    description={
                        material
                            ? `Currently a ${material.type_label.toLowerCase()} (${material.file_size_label}).`
                            : 'Choose the material type, then upload the file.'
                    }
                />
                <CardBody className="space-y-5">
                    {!material && (
                        <Select
                            label="Material type"
                            name="type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value as 'pdf' | 'video')}
                            error={errors.type}
                        >
                            <option value="pdf">PDF document</option>
                            <option value="video">Training video</option>
                        </Select>
                    )}

                    <FileDropzone
                        id="file"
                        label={material ? 'Replace file' : 'File'}
                        optional={Boolean(material)}
                        file={data.file}
                        onChange={(file) => setData('file', file)}
                        accept={isVideo ? '.mp4,.mov,.webm' : '.pdf'}
                        typesLabel={isVideo ? 'MP4, MOV or WebM' : 'PDF'}
                        maxMb={maxMb}
                        error={errors.file}
                        hint={material ? 'Leave empty to keep the current file.' : undefined}
                    />
                </CardBody>
            </Card>

            <Card>
                <CardHeader title="Access and ordering" />
                <CardBody className="space-y-5">
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="available_during_temporary"
                            checked={data.available_during_temporary}
                            onChange={(e) => setData('available_during_temporary', e.target.checked)}
                            className="checkbox mt-0.5"
                        />
                        <label htmlFor="available_during_temporary" className="text-sm">
                            <span className="font-medium text-ink">Available during temporary access</span>
                            <span className="mt-0.5 block text-[13px] text-stone-500">
                                New Disers can open this during their 7-day temporary access period.
                            </span>
                        </label>
                    </div>

                    <div className="sm:w-48">
                        <Input
                            label="Sort order"
                            name="sort_order"
                            type="number"
                            min={0}
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', Number(e.target.value))}
                            error={errors.sort_order}
                            hint="Lower numbers appear first."
                            className="tabular"
                        />
                    </div>
                </CardBody>
                <CardFooter>
                    <Link href={route('admin.learning-materials.index')} className={buttonClass('secondary')}>
                        Cancel
                    </Link>
                    <Button type="submit" loading={processing}>
                        {material ? 'Save changes' : 'Upload material'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
