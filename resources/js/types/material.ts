export interface Category {
    id: number;
    name: string;
}

export interface AdminCategory extends Category {
    description: string | null;
    is_active: boolean;
    materials_count: number;
}

export interface AdminMaterial {
    id: number;
    title: string;
    description: string | null;
    type: 'pdf' | 'video';
    type_label: string;
    /** Only set for videos: where the video plays from. */
    video_source: VideoSource | null;
    external_url: string | null;
    orientation: Orientation;
    status: 'draft' | 'published' | 'archived';
    status_label: string;
    available_during_temporary: boolean;
    sort_order: number;
    category: string | null;
    learning_material_category_id: number;
    uploaded_by: string | null;
    file_size_label: string;
    uploaded_at: string;
    can_update: boolean;
    can_archive: boolean;
}

export interface MaterialFormOptions {
    categories: Category[];
    max_pdf_mb: number;
    /** null = no size limit set by the app. */
    max_video_mb: number | null;
}

export interface PortalMaterial {
    id: number;
    title: string;
    description: string | null;
    type: 'pdf' | 'video';
    category: string | null;
    locked: boolean;
}

export type VideoSource = 'upload' | 'link';

/** Frame shape for embedded videos; uploaded files are measured in the browser. */
export type Orientation = 'landscape' | 'portrait';

export interface VideoEmbed {
    kind: 'youtube' | 'vimeo' | 'drive' | 'direct';
    src: string;
}
