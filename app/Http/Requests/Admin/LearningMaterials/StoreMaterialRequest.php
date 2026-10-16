<?php

namespace App\Http\Requests\Admin\LearningMaterials;

use App\Enums\MaterialType;
use App\Models\LearningMaterial;
use Illuminate\Validation\Rules\Enum;

class StoreMaterialRequest extends MaterialFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', LearningMaterial::class);
    }

    protected function fileRequired(): bool
    {
        return true; // only reached in upload mode
    }

    protected function defaultVideoSource(): string
    {
        return self::SOURCE_UPLOAD;
    }

    protected function materialType(): ?MaterialType
    {
        return MaterialType::tryFrom((string) $this->input('type'));
    }

    public function rules(): array
    {
        return [
            ...$this->commonRules(),
            'type' => ['required', new Enum(MaterialType::class)],
        ];
    }
}
