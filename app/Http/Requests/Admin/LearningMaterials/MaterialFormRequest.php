<?php

namespace App\Http\Requests\Admin\LearningMaterials;

use App\Enums\MaterialStatus;
use App\Enums\MaterialType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

abstract class MaterialFormRequest extends FormRequest
{
    protected function commonRules(): array
    {
        $maxKb = max(
            config('portal.learning_materials.max_pdf_kb'),
            config('portal.learning_materials.max_video_kb'),
        );

        return [
            'learning_material_category_id' => ['required', 'integer', Rule::exists('learning_material_categories', 'id')->whereNull('deleted_at')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', new Enum(MaterialStatus::class)],
            'available_during_temporary' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            // The mimes rule checks the real file signature, not just the
            // extension (Symfony's MimeTypeGuesser). The Service adds a
            // second, explicit finfo check on top of this.
            'file' => [
                $this->fileRequired() ? 'required' : 'nullable',
                'file',
                'mimes:pdf,mp4,mov,webm',
                'max:'.$maxKb,
            ],
        ];
    }

    abstract protected function fileRequired(): bool;
}