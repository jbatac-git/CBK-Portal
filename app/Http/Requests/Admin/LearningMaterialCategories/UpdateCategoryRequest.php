<?php

namespace App\Http\Requests\Admin\LearningMaterialCategories;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('learning_material_category'));
    }

    /** The slug is generated once on create and never edited, so it is not accepted here. */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('learning_material_categories', 'name')
                    ->ignore($this->route('learning_material_category'))
                    ->whereNull('deleted_at'),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required.',
            'name.unique' => 'A category with this name already exists.',
        ];
    }
}
