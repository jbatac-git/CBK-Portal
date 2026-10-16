<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'photo' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:'.config('portal.avatar.max_kb'),
                // Caps decoded memory: a tiny, highly compressed file can still be huge in pixels.
                'dimensions:max_width=4000,max_height=4000'],
        ];
    }
}
