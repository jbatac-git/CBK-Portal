<?php

namespace App\Http\Requests\Admin\RemovalRequests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('requestRemoval', $this->route('user'));
    }

    public function rules(): array
    {
        return [
            'removal_reason_id' => ['required', Rule::exists('removal_reasons', 'id')->where('is_active', true)->whereNull('deleted_at')],
            'details' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
