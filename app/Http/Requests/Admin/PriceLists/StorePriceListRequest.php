<?php

namespace App\Http\Requests\Admin\PriceLists;

use App\Models\PriceList;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use App\Enums\PriceListStatus;

class StorePriceListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', PriceList::class);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'effective_date' => ['nullable', 'date'],
            'status' => ['required', new Enum(PriceListStatus::class)],
            'file' => ['required', 'file', 'mimes:pdf', 'max:'.config('portal.price_lists.max_kb')],
        ];
    }
}