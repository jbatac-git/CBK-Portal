import { FileText, UploadCloud, X } from 'lucide-react';
import { DragEvent, KeyboardEvent, ReactNode, useRef, useState } from 'react';

interface FileDropzoneProps {
    id: string;
    label: string;
    file: File | null;
    onChange: (file: File | null) => void;
    /** Value for the native `accept` attribute, e.g. ".pdf" or ".mp4,.mov,.webm". */
    accept: string;
    /** Human-readable list of allowed types, e.g. "PDF". */
    typesLabel: string;
    /** Upper size limit in megabytes; omitted when the server does not send one. */
    maxMb?: number;
    error?: string;
    optional?: boolean;
    /** Extra line under the drop area, e.g. "Leave empty to keep the current file." */
    hint?: ReactNode;
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Click-or-drop file picker. The hidden native input keeps keyboard and screen-reader support. */
export default function FileDropzone({
    id,
    label,
    file,
    onChange,
    accept,
    typesLabel,
    maxMb,
    error,
    optional,
    hint,
}: FileDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const open = () => inputRef.current?.click();

    const clear = () => {
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) onChange(dropped);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
        }
    };

    const limits = [typesLabel, maxMb !== undefined ? `up to ${maxMb} MB` : null].filter(Boolean).join(', ');
    const tooLarge = file !== null && maxMb !== undefined && file.size > maxMb * 1024 * 1024;

    return (
        <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={id} className="text-[13px] font-medium text-stone-800">
                    {label}
                </label>
                {optional && <span className="text-2xs text-stone-400">Optional</span>}
            </div>

            <input
                ref={inputRef}
                id={id}
                name="file"
                type="file"
                accept={accept}
                className="sr-only"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : file ? undefined : `${id}-limits`}
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />

            {file ? (
                <div
                    className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-hairline ${
                        error || tooLarge ? 'border-red-300' : 'border-line'
                    }`}
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-paper">
                        <FileText className="h-4 w-4 text-stone-400" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink" title={file.name}>
                            {file.name}
                        </p>
                        <p className={`font-mono text-xs ${tooLarge ? 'text-red-700' : 'text-stone-500'}`}>
                            {formatBytes(file.size)}
                            {tooLarge && ` — larger than the ${maxMb} MB limit`}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={open}
                        className="inline-flex h-7 items-center rounded px-2 text-[13px] font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink"
                    >
                        Change
                    </button>
                    <button
                        type="button"
                        onClick={clear}
                        aria-label="Remove selected file"
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-stone-400 transition-colors hover:bg-stone-100 hover:text-ink"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            ) : (
                <div
                    role="button"
                    tabIndex={0}
                    aria-controls={id}
                    aria-label={`${label}: choose a file or drag it here`}
                    onClick={open}
                    onKeyDown={onKeyDown}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`flex cursor-pointer flex-col items-center rounded-lg border border-dashed px-6 py-8 text-center transition-colors ${
                        dragging
                            ? 'border-maroon-400 bg-maroon-50/60'
                            : error
                              ? 'border-red-300 bg-white hover:bg-paper'
                              : 'border-stone-300 bg-white hover:border-stone-400 hover:bg-paper'
                    }`}
                >
                    <UploadCloud className={`h-5 w-5 ${dragging ? 'text-maroon-700' : 'text-stone-400'}`} aria-hidden="true" />
                    <p className="mt-2 text-sm text-stone-700">
                        <span className="font-medium text-maroon-700">Choose a file</span> or drag it here
                    </p>
                    <p id={`${id}-limits`} className="mt-1 font-mono text-2xs uppercase tracking-[0.08em] text-stone-500">
                        {limits}
                    </p>
                </div>
            )}

            {error ? (
                <p id={`${id}-error`} className="text-[13px] text-red-700">
                    {error}
                </p>
            ) : (
                hint && <p className="text-[13px] text-stone-500">{hint}</p>
            )}
        </div>
    );
}
