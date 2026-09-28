<?php

namespace App\Http\Requests\Admin\Users;

use App\Enums\PortalModule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

abstract class UserFormRequest extends FormRequest
{
    /** Emails are stored lowercase, so normalise before validating. */
    protected function prepareForValidation(): void
    {
        if ($this->has('email')) {
            $this->merge(['email' => Str::lower(trim((string) $this->input('email')))]);
        }
    }

    /** Rules shared by "create" and "update". */
    protected function commonRules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'company_id' => ['required', 'integer', Rule::exists('companies', 'id')->whereNull('deleted_at')],
            'modules' => ['nullable', 'array'],
            'modules.*' => ['string', new Enum(PortalModule::class)],
        ];
    }

    /** Spec: Department is optional for Disers, required for everyone else. */
    protected function departmentRules(bool $required): array
    {
        return [
            $required ? 'required' : 'nullable',
            'integer',
            Rule::exists('departments', 'id')->whereNull('deleted_at'),
        ];
    }
}