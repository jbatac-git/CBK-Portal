<?php

namespace App\Http\Requests\Admin\Users;

use App\Enums\RoleName;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreUserRequest extends UserFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    /**
     * Store the ID in one consistent form, so "cbk-0153" and " CBK-0153 "
     * are recognised as the same employee by the unique check.
     */
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        if ($this->has('employee_id')) {
            $id = preg_replace('/\s+/', ' ', trim((string) $this->input('employee_id')));
            $this->merge(['employee_id' => Str::upper($id)]);
        }
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
            // The full ID as printed on the employee's records (e.g. "CBK-2024-0153");
            // the username uses its last 2 digits.
            'employee_id' => [
                'required',
                'string',
                'max:30',
                'regex:/^[A-Z0-9][A-Z0-9\-\/. ]*$/',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (preg_match_all('/\d/', (string) $value) < 2) {
                        $fail('Employee ID must contain at least 2 digits (the username uses the last 2).');
                    }
                },
                'unique:users,employee_id',
            ],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in($assignable)],
            'department_id' => $this->departmentRules($this->input('role') !== RoleName::Diser->value),
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.regex' => 'Employee ID can only contain letters, numbers, spaces, and - / .',
            'employee_id.unique' => 'This Employee ID is already registered.',
            'email.unique' => 'This email address is already used by another account.',
            'role.in' => 'You are not allowed to assign that role.',
            'department_id.required' => 'Department is required for this role.',
        ];
    }
}
