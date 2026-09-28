<?php

namespace App\Http\Requests\Admin\Users;

use App\Enums\RoleName;
use App\Models\User;
use Illuminate\Validation\Rule;

class StoreUserRequest extends UserFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    public function rules(): array
    {
        // Never trust the dropdown: re-check the role on the server.
        $assignable = array_map(
            fn (RoleName $role) => $role->value,
            RoleName::assignableBy($this->user()),
        );

        return [
            ...$this->commonRules(),
            'employee_id' => ['required', 'string', 'regex:/^\d{2,20}$/', 'unique:users,employee_id'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in($assignable)],
            'department_id' => $this->departmentRules($this->input('role') !== RoleName::Diser->value),
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.regex' => 'Employee ID must contain digits only (at least 2).',
            'employee_id.unique' => 'This Employee ID is already registered.',
            'email.unique' => 'This email address is already used by another account.',
            'role.in' => 'You are not allowed to assign that role.',
            'department_id.required' => 'Department is required for this role.',
        ];
    }
}