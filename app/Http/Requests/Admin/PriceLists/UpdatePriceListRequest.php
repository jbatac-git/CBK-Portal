<?php

namespace App\Http\Requests\Admin\PriceLists;

use App\Enums\PriceListFileType;
use App\Enums\PriceListStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdatePriceListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('price_list'));
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'effective_date' => ['nullable', 'date'],
            'status' => ['required', new Enum(PriceListStatus::class)],
            // The real content (PDF or .xlsx workbook) is checked in PriceListService.
            'file' => ['nullable', 'file', 'extensions:'.implode(',', PriceListFileType::extensions()), 'max:'.config('portal.price_lists.max_kb')],
        ];
    }
}
