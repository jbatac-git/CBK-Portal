import FileDropzone from '@/Components/Materials/FileDropzone';
import Button, { buttonClass } from '@/Components/UI/Button';
import Card, { CardBody, CardFooter, CardHeader } from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Textarea from '@/Components/UI/Textarea';
import { AdminMaterial, MaterialFormOptions, Orientation, VideoSource } from '@/types/material';
import { Link, useForm } from '@inertiajs/react';
import { FileText, Link2, LucideIcon, Video } from 'lucide-react';
import { FormEventHandler, KeyboardEvent } from 'react';

/** What the admin is adding: maps to the `type` + `video_source` pair the backend expects. */
type Format = 'pdf' | 'video-upload' | 'video-link';

const FORMATS: { value: Format; label: string; hint: string; icon: LucideIcon }[] = [
    { value: 'pdf', label: 'PDF document', hint: 'Handbooks, SOPs, guides', icon: FileText },
    { value: 'video-upload', label: 'Video file', hint: 'Upload MP4, MOV or WebM', icon: Video },
    { value: 'video-link', label: 'Video link', hint: 'YouTube, Vimeo, Drive or .mp4 URL', icon: Link2 },
];

interface FormatPickerProps {
    label: string;
    value: Format;
    options: Format[];
    onChange: (format: Format) => void;
    error?: string;
}

/** Card-style radio group so the three ways to add content are visible up front. */
function FormatPicker({ label, value, options, onChange, error }: FormatPickerProps) {
    const items = FORMATS.filter((f) => options.includes(f.value));

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        const index = items.findIndex((f) => f.value === value);
        const next = items[(index + step + items.length) % items.length].value;
        onChange(next);
        e.currentTarget.querySelector<HTMLButtonElement>(`[data-value="${next}"]`)?.focus();
    };

    return (
        <div className="space-y-1.5">
            <p id="format-label" className="text-[13px] font-medium text-stone-800">
                {label}
            </p>
            <div
                role="radiogroup"
                aria-labelledby="format-label"
                onKeyDown={onKeyDown}
                className={`grid gap-3 ${items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
            >
                {items.map(({ value: v, label, hint, icon: Icon }) => {
                    const selected = v === value;

                    return (
                        <button
                            key={v}
                            type="button"
                            role="radio"
                            data-value={v}
                            aria-checked={selected}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => onChange(v)}
                            className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-maroon-500/40 ${
                                selected ? 'border-maroon-600 bg-maroon-50/50 ring-1 ring-maroon-600' : 'border-line bg-white hover:border-stone-300'
                            }`}
                        >
                            <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                                    selected ? 'bg-maroon-700 text-white' : 'bg-stone-100 text-stone-500'
                                }`}
                            >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-medium text-ink">{label}</span>
                                <span className="mt-0.5 block text-xs text-stone-500">{hint}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
            {error && <p className="text-[13px] text-red-700">{error}</p>}
        </div>
    );
}

const ORIENTATIONS: { value: Orientation; label: string; hint: string }[] = [
    { value: 'landscape', label: 'Landscape', hint: '16:9 · regular YouTube, Vimeo' },
    { value: 'portrait', label: 'Portrait', hint: '9:16 · Shorts, phone recordings' },
];

/** Frame shape for linked videos; the player cannot measure an embedded video itself. */
function OrientationPicker({ value, onChange, error }: { value: Orientation; onChange: (value: Orientation) => void; error?: string }) {
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
        e.preventDefault();
        const next = value === 'landscape' ? 'portrait' : 'landscape';
        onChange(next);
        e.currentTarget.querySelector<HTMLButtonElement>(`[data-value="${next}"]`)?.focus();
    };

    return (
        <div className="space-y-1.5">
            <p id="orientation-label" className="text-[13px] font-medium text-stone-800">
                Orientation
            </p>
            <div role="radiogroup" aria-labelledby="orientation-label" onKeyDown={onKeyDown} className="grid gap-3 sm:grid-cols-2">
                {ORIENTATIONS.map((option) => {
                    const selected = option.value === value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            data-value={option.value}
                            aria-checked={selected}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => onChange(option.value)}
                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-maroon-500/40 ${
                                selected ? 'border-maroon-600 bg-maroon-50/50 ring-1 ring-maroon-600' : 'border-line bg-white hover:border-stone-300'
                            }`}
                        >
                            {/* A tiny frame drawn in the chosen shape. */}
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center" aria-hidden="true">
                                <span
                                    className={`block rounded-[3px] border-2 ${selected ? 'border-maroon-700' : 'border-stone-400'} ${
                                        option.value === 'landscape' ? 'h-[18px] w-8' : 'h-8 w-[18px]'
                                    }`}
                                />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-medium text-ink">{option.label}</span>
                                <span className="mt-0.5 block text-xs text-stone-500">{option.hint}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
            {error && <p className="text-[13px] text-red-700">{error}</p>}
        </div>
    );
}

interface MaterialFormProps {
    options: MaterialFormOptions;
    material?: AdminMaterial;
}

export default function MaterialForm({ options, material }: MaterialFormProps) {
    const { data, setData, post, processing, errors, transform } = useForm({
        learning_material_category_id: material ? String(material.learning_material_category_id) : '',
        title: material?.title ?? '',
        description: material?.description ?? '',
        type: material?.type ?? 'pdf',
        status: material?.status ?? 'draft',
        available_during_temporary: material?.available_during_temporary ?? false,
        sort_order: material?.sort_order ?? 0,
        video_source: (material?.video_source ?? 'upload') as VideoSource,
        external_url: material?.external_url ?? '',
        orientation: (material?.orientation ?? 'landscape') as Orientation,
        file: null as File | null,
        _method: material ? 'put' : 'post',
    });

    const isVideo = data.type === 'video';
    const isLink = isVideo && data.video_source === 'link';
    const format: Format = !isVideo ? 'pdf' : isLink ? 'video-link' : 'video-upload';
    const formatOptions: Format[] = ['pdf', 'video-upload', 'video-link'];
    const maxMb = (isVideo ? options.max_video_mb : options.max_pdf_mb) ?? undefined;
    // The current file can only be kept when the format stays the same upload type.
    const originalFormat: Format | null = !material
        ? null
        : material.type === 'pdf'
          ? 'pdf'
          : material.video_source === 'link'
            ? 'video-link'
            : 'video-upload';
    const hasStoredFile = originalFormat !== null && originalFormat !== 'video-link' && format === originalFormat;

    const chooseFormat = (next: Format) => {
        setData((current) => ({
            ...current,
            type: next === 'pdf' ? 'pdf' : 'video',
            video_source: next === 'video-link' ? 'link' : 'upload',
            // A file picked for one format is never valid for another.
            file: next === format ? current.file : null,
        }));
    };

    // Only send the fields that belong to the chosen source, so a file picked
    // before switching to "Video link" (or a stale URL) is never submitted.
    transform((d) => ({
        ...d,
        video_source: isLink ? 'link' : 'upload',
        external_url: isLink ? d.external_url.trim() : '',
        file: isLink ? null : d.file,
    }));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // A file input needs multipart/form-data: Inertia's useForm switches
        // to that automatically whenever any field in `data` is a File.
        post(material ? route('admin.learning-materials.update', material.id) : route('admin.learning-materials.store'));
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <Card>
                <CardHeader
                    title="Content"
                    description={
                        material
                            ? material.video_source === 'link'
                                ? 'Currently plays from a video link.'
                                : `Currently a ${material.type_label.toLowerCase()} (${material.file_size_label}).`
                            : 'Choose the format, then add the file or paste the link.'
                    }
                />
                <CardBody className="space-y-5">
                    <FormatPicker label={material ? 'Format' : 'What are you adding?'} value={format} options={formatOptions} onChange={chooseFormat} error={errors.type ?? errors.video_source} />

                    {originalFormat !== null && format !== originalFormat && (
                        <p className="rounded-md border border-gold-200 bg-gold-50 px-3.5 py-2.5 text-[13px] text-gold-700">
                            Changing the format replaces the current content when you save.
                            {format === 'video-link' ? ' Paste the new video link below.' : ' Add the new file below.'}
                        </p>
                    )}

                    {isLink ? (
                        <>
                            <Input
                                label="Video link"
                                name="external_url"
                                type="url"
                                inputMode="url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={data.external_url}
                                onChange={(e) => {
                                    const url = e.target.value;
                                    // YouTube Shorts are always vertical.
                                    setData((current) => ({
                                        ...current,
                                        external_url: url,
                                        orientation: /youtube\.com\/shorts\//i.test(url) ? 'portrait' : current.orientation,
                                    }));
                                }}
                                error={errors.external_url}
                                hint="YouTube, Vimeo, Google Drive or a direct .mp4 link. For YouTube, set the video to Unlisted."
                            />
                            <OrientationPicker
                                value={data.orientation}
                                onChange={(value) => setData('orientation', value)}
                                error={errors.orientation}
                            />
                        </>
                    ) : (
                        <FileDropzone
                            key={format}
                            id="file"
                            label={hasStoredFile ? 'Replace file' : 'File'}
                            optional={hasStoredFile}
                            file={data.file}
                            onChange={(file) => setData('file', file)}
                            accept={isVideo ? '.mp4,.mov,.webm,video/mp4,video/quicktime,video/webm' : '.pdf,application/pdf'}
                            typesLabel={isVideo ? 'MP4, MOV or WebM' : 'PDF'}
                            maxMb={maxMb}
                            error={errors.file}
                            hint={hasStoredFile ? 'Leave empty to keep the current file.' : undefined}
                        />
                    )}
                </CardBody>
            </Card>

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
                        {material ? 'Save changes' : isLink ? 'Add material' : 'Upload material'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
