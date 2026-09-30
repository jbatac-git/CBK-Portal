<?php

namespace App\Http\Requests\Admin\LearningMaterials;

use App\Models\LearningMaterial;
use Illuminate\Validation\Rules\Enum;
use App\Enums\MaterialType;

class StoreMaterialRequest extends MaterialFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', LearningMaterial::class);
    }

    protected function fileRequired(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            ...$this->commonRules(),
            'type' => ['required', new Enum(MaterialType::class)],
        ];
    }
}