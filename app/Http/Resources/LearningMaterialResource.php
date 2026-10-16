<?php

namespace App\Http\Resources;

use App\Enums\MaterialType;
use App\Models\LearningMaterial;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin LearningMaterial */
class LearningMaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isLink = $this->isExternalLink();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type->value,
            'type_label' => $isLink && $this->type === MaterialType::Video ? 'Video link' : $this->type->label(),
            'video_source' => $this->type === MaterialType::Video ? ($isLink ? 'link' : 'upload') : null,
            'external_url' => $this->external_url,
            'orientation' => $this->orientation,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'available_during_temporary' => $this->available_during_temporary,
            'sort_order' => $this->sort_order,
            'category' => $this->category?->name,
            'learning_material_category_id' => $this->learning_material_category_id,
            'uploaded_by' => $this->uploader?->name,
            'file_size_label' => $this->humanFileSize(),
            'uploaded_at' => $this->created_at->toIso8601String(),
            'can_update' => $request->user()?->can('update', $this->resource) ?? false,
            'can_archive' => $request->user()?->can('archive', $this->resource) ?? false,
        ];
    }

    private function humanFileSize(): string
    {
        if ($this->file_size === null) {
            return '—';
        }

        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes >= 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 1).' '.$units[$i];
    }
}
