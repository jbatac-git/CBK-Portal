<?php

namespace App\Http\Requests\Admin\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRolePermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('roles.manage');
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', Rule::in(['Admin', 'HR'])],
            'permissions' => ['array'],
            'permissions.*' => ['string'],
        ];
    }
}