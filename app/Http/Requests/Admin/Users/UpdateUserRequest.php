<?php

namespace App\Http\Requests\Admin\Users;

use App\Enums\RoleName;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends UserFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('user'));
    }

    public function rules(): array
    {
        $target = $this->route('user');

        return [
            ...$this->commonRules(),
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($target)],
            'department_id' => $this->departmentRules(! $target->hasRole(RoleName::Diser->value)),
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email address is already used by another account.',
            'department_id.required' => 'Department is required for this role.',
        ];
    }
}