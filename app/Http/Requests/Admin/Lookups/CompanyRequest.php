<?php

namespace App\Http\Requests\Admin\Lookups;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompanyRequest extends FormRequest
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
                Rule::unique('companies', 'name')->ignore($this->route('company'))->whereNull('deleted_at'),
            ],
            'is_active' => ['boolean'],
        ];
    }
}