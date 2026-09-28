<?php

namespace App\Http\Requests\Admin\RemovalRequests;

use App\Enums\RemovalReason;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class SubmitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('requestRemoval', $this->route('user'));
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', new Enum(RemovalReason::class)],
            'details' => ['nullable', 'string', 'max:1000'],
        ];
    }
}