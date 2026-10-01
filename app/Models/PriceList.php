<?php

namespace App\Models;

use App\Enums\PriceListStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PriceList extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'file_disk', 'file_path', 'mime_type', 'file_size',
        'effective_date', 'status', 'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => PriceListStatus::class,
            'effective_date' => 'date',
            'file_size' => 'integer',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', PriceListStatus::Active);
    }
}