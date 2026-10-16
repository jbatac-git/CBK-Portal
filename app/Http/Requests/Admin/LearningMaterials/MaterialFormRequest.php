<?php

namespace App\Http\Requests\Admin\LearningMaterials;

use App\Enums\MaterialStatus;
use App\Enums\MaterialType;
use App\Services\Materials\VideoEmbed;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

abstract class MaterialFormRequest extends FormRequest
{
    public const SOURCE_UPLOAD = 'upload';

    public const SOURCE_LINK = 'link';

    /** File extensions accepted per material type. */
    private const EXTENSIONS = [
        'pdf' => 'pdf',
        'video' => 'mp4,mov,webm',
    ];

    /**
     * A video without an explicit source keeps its current one (upload on
     * create), so older clients that never send `video_source` still work.
     */
    protected function prepareForValidation(): void
    {
        if ($this->materialType() === MaterialType::Video && ! $this->filled('video_source')) {
            $this->merge(['video_source' => $this->defaultVideoSource()]);
        }
    }

    protected function commonRules(): array
    {
        return [
            'learning_material_category_id' => ['required', 'integer', Rule::exists('learning_material_categories', 'id')->whereNull('deleted_at')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', new Enum(MaterialStatus::class)],
            'available_during_temporary' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'video_source' => $this->videoSourceRules(),
            'external_url' => $this->externalUrlRules(),
            'orientation' => ['nullable', Rule::in(['landscape', 'portrait'])],
            'file' => $this->fileRules(),
        ];
    }

    public function messages(): array
    {
        return [
            'video_source.in' => 'PDF documents must be uploaded as a file.',
            'external_url.required' => 'Enter the video link.',
            'external_url.url' => 'The video link must be a secure (https) URL.',
            'file.prohibited' => 'Remove the file when using a video link.',
        ];
    }

    /** True when this request saves a video that plays from an external link. */
    public function usesVideoLink(): bool
    {
        return $this->materialType() === MaterialType::Video
            && $this->input('video_source') === self::SOURCE_LINK;
    }

    private function videoSourceRules(): array
    {
        // Only videos may come from a link; a PDF must always be an upload.
        $allowed = $this->materialType() === MaterialType::Pdf
            ? [self::SOURCE_UPLOAD]
            : [self::SOURCE_UPLOAD, self::SOURCE_LINK];

        return ['nullable', 'string', Rule::in($allowed)];
    }

    private function externalUrlRules(): array
    {
        if (! $this->usesVideoLink()) {
            return ['nullable', 'prohibited'];
        }

        return [
            'required',
            'string',
            'max:2048',
            'url:https',
            function (string $attribute, mixed $value, Closure $fail) {
                if (VideoEmbed::fromUrl(is_string($value) ? trim($value) : null) === null) {
                    $fail('Use a YouTube, Vimeo or Google Drive link, or a direct https link to an .mp4 or .webm file.');
                }
            },
        ];
    }

    /**
     * Size and extension limits follow the material's type, so a PDF cannot
     * use the much larger video allowance. The mimes rule checks the real
     * file signature, not just the extension (Symfony's MimeTypeGuesser),
     * and the Service adds a second, explicit finfo check on top of this.
     */
    private function fileRules(): array
    {
        if ($this->usesVideoLink()) {
            return ['nullable', 'prohibited'];
        }

        $type = $this->materialType();

        $extensions = $type ? self::EXTENSIONS[$type->value] : implode(',', self::EXTENSIONS);
        // Without a valid type there is nothing to size against; the type rule fails anyway.
        $maxKb = $type?->maxKilobytes();

        return array_values(array_filter([
            $this->fileRequired() ? 'required' : 'nullable',
            'file',
            'mimes:'.$extensions,
            $maxKb !== null ? 'max:'.$maxKb : null,
        ]));
    }

    /** Whether an uploaded file must accompany this request (upload mode only). */
    abstract protected function fileRequired(): bool;

    /** The source a video keeps when the request does not name one. */
    abstract protected function defaultVideoSource(): string;

    /** The type the uploaded file must match; null when the submitted type is invalid. */
    abstract protected function materialType(): ?MaterialType;
}
