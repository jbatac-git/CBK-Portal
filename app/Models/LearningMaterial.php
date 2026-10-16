<?php

namespace App\Models;

use App\Enums\MaterialStatus;
use App\Enums\MaterialType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class LearningMaterial extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'learning_material_category_id',
        'title',
        'slug',
        'description',
        'type',
        'external_url',
        'file_disk',
        'file_path',
        'mime_type',
        'file_size',
        'status',
        'available_during_temporary',
        'sort_order',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'type' => MaterialType::class,
            'status' => MaterialStatus::class,
            'available_during_temporary' => 'boolean',
            'file_size' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $material) {
            if (empty($material->slug)) {
                $material->slug = Str::slug($material->title).'-'.Str::random(6);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(LearningMaterialCategory::class, 'learning_material_category_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', MaterialStatus::Published);
    }

    /** True when this video points to an external link instead of an uploaded file. */
    public function isExternalLink(): bool
    {
        return filled($this->external_url);
    }

    /** True when a TEMPORARY Diser is not yet allowed to open this specific material. */
    public function isLockedFor(User $user): bool
    {
        return $user->isRestrictedToInitialMaterials() && ! $this->available_during_temporary;
    }
}
