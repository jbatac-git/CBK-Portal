<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // always one's own profile
    }

    public function rules(): array
    {
        return [
            'contact_number' => ['nullable', 'string', 'max:30'],
        ];
    }
}