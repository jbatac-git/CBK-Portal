<?php

namespace App\Http\Requests\Admin\LearningMaterials;

use App\Models\LearningMaterial;

class UpdateMaterialRequest extends MaterialFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('learning_material'));
    }

    protected function fileRequired(): bool
    {
        return false; // replacing the file is optional on edit
    }

    public function rules(): array
    {
        return $this->commonRules(); // `type` is fixed at creation, not editable here
    }
}