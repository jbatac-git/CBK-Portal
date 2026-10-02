<?php

namespace App\Http\Requests\Admin\Lookups;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RemovalReasonRequest extends FormRequest
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
                Rule::unique('removal_reasons', 'name')->ignore($this->route('removal_reason'))->whereNull('deleted_at'),
            ],
            'is_active' => ['boolean'],
        ];
    }
}