<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangeTemporaryPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // the route is already behind auth
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults(), 'different:current_password'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.current_password' => 'The temporary password is incorrect.',
            'password.different' => 'Your new password must be different from the temporary password.',
        ];
    }
}