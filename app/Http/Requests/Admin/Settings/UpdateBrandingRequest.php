<?php

namespace App\Http\Requests\Admin\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.manage');
    }

    public function rules(): array
    {
        return [
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:'.config('portal.logo.max_kb')],
            'footer.company_name' => ['required', 'string', 'max:255'],
            'footer.copyright' => ['nullable', 'string', 'max:255'],
            'footer.contact' => ['nullable', 'string', 'max:255'],
            'footer.website' => ['nullable', 'string', 'max:255'],
            'footer.address' => ['nullable', 'string', 'max:500'],
        ];
    }
}