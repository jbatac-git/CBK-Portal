<?php

namespace App\Http\Requests\Admin\LearningMaterials;

use App\Enums\MaterialType;
use App\Models\LearningMaterial;

class UpdateMaterialRequest extends MaterialFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->material());
    }

    /**
     * Replacing the file is optional on edit — except when a link video is
     * switched to an uploaded one, which then has no file to keep.
     */
    protected function fileRequired(): bool
    {
        return $this->material()->isExternalLink();
    }

    protected function defaultVideoSource(): string
    {
        return $this->material()->isExternalLink() ? self::SOURCE_LINK : self::SOURCE_UPLOAD;
    }

    protected function materialType(): ?MaterialType
    {
        return $this->material()->type;
    }

    public function rules(): array
    {
        return $this->commonRules(); // `type` is fixed at creation, not editable here
    }

    private function material(): LearningMaterial
    {
        return $this->route('learning_material');
    }
}
