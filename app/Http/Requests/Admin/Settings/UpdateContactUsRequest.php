<?php

namespace App\Http\Requests\Admin\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContactUsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('contact-us.manage');
    }

    public function rules(): array
    {
        return [
            'contact.headline' => ['required', 'string', 'max:255'],
            'contact.phone' => ['required', 'string', 'max:50'],
            'contact.email' => ['required', 'email', 'max:255'],
            'contact.website' => ['nullable', 'string', 'max:255'],
            'contact.location' => ['nullable', 'string', 'max:500'],
        ];
    }
}