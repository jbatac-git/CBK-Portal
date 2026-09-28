<?php

namespace App\Http\Requests\Admin\RemovalRequests;

use Illuminate\Foundation\Http\FormRequest;

class DeclineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('process', $this->route('removalRequest'));
    }

    public function rules(): array
    {
        return [
            'decision_note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}