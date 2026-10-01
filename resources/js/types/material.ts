export interface Category {
    id: number;
    name: string;
}

export interface AdminMaterial {
    id: number;
    title: string;
    description: string | null;
    type: 'pdf' | 'video';
    type_label: string;
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
    max_video_mb: number;
}

export interface PortalMaterial {
    id: number;
    title: string;
    description: string | null;
    type: 'pdf' | 'video';
    category: string | null;
    locked: boolean;
}