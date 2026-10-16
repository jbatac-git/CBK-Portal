<?php

namespace App\Http\Requests\Admin\LearningMaterials;

use App\Enums\MaterialStatus;
use App\Enums\MaterialType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

abstract class MaterialFormRequest extends FormRequest
{
    /** File extensions accepted per material type. */
    private const EXTENSIONS = [
        'pdf' => 'pdf',
        'video' => 'mp4,mov,webm',
    ];

    protected function commonRules(): array
    {
        return [
            'learning_material_category_id' => ['required', 'integer', Rule::exists('learning_material_categories', 'id')->whereNull('deleted_at')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', new Enum(MaterialStatus::class)],
            'available_during_temporary' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'file' => $this->fileRules(),
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
        $type = $this->materialType();

        $extensions = $type ? self::EXTENSIONS[$type->value] : implode(',', self::EXTENSIONS);
        $maxKb = $type?->maxKilobytes() ?? max(array_map(
            fn (MaterialType $t) => $t->maxKilobytes(),
            MaterialType::cases(),
        ));

        return [
            $this->fileRequired() ? 'required' : 'nullable',
            'file',
            'mimes:'.$extensions,
            'max:'.$maxKb,
        ];
    }

    abstract protected function fileRequired(): bool;

    /** The type the uploaded file must match; null when the submitted type is invalid. */
    abstract protected function materialType(): ?MaterialType;
}
