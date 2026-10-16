<?php

namespace App\Http\Requests\Admin\LearningMaterials;

use App\Enums\MaterialType;
use App\Models\LearningMaterial;
use Illuminate\Validation\Rules\Enum;

class UpdateMaterialRequest extends MaterialFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->material());
    }

    /**
     * Replacing the file is optional on edit, except when there is no
     * matching file to keep: a link switched to an upload, or a change of
     * format (e.g. PDF to video), which needs a new file of the new type.
     */
    protected function fileRequired(): bool
    {
        return $this->material()->isExternalLink() || $this->changesType();
    }

    protected function defaultVideoSource(): string
    {
        return $this->material()->isExternalLink() && ! $this->changesType() ? self::SOURCE_LINK : self::SOURCE_UPLOAD;
    }

    /** The submitted type, or the current one when the form does not send it. */
    protected function materialType(): ?MaterialType
    {
        if (! $this->filled('type')) {
            return $this->material()->type;
        }

        return MaterialType::tryFrom((string) $this->input('type'));
    }

    public function rules(): array
    {
        return [
            ...$this->commonRules(),
            'type' => ['sometimes', 'required', new Enum(MaterialType::class)],
        ];
    }

    private function changesType(): bool
    {
        $type = $this->materialType();

        return $type !== null && $type !== $this->material()->type;
    }

    private function material(): LearningMaterial
    {
        return $this->route('learning_material');
    }
}
