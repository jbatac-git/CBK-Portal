<?php

namespace App\Http\Requests\Admin\Lookups;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.manage');
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('departments', 'name')->ignore($this->route('department'))->whereNull('deleted_at'),
            ],
            'is_active' => ['boolean'],
        ];
    }
}