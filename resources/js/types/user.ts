export interface Option {
    value: string;
    label: string;
}

export interface LookupOption {
    id: number;
    name: string;
}

export interface CredentialsEmail {
    status: 'queued' | 'sent' | 'failed';
    sent_at: string | null;
    error: string | null;
}

export interface Employee {
    id: number;
    name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    username: string;
    employee_id: string;
    email: string;
    contact_number: string | null;
    photo_url: string | null;
    company_id: number;
    department_id: number | null;
    company: string | null;
    department: string | null;
    role: string | null;
    status: string;
    status_label: string;
    temporary_days_left: number | null;
    /** Delivery of the latest temporary-credentials email; null when none was sent. */
    credentials_email: CredentialsEmail | null;
    modules?: string[];
    can_update: boolean;
    has_pending_removal: boolean;
    can_approve: boolean;
    can_decline: boolean;
    can_deactivate: boolean;
    can_request_removal: boolean;
    can_resend_credentials: boolean;
}

export interface UserFormOptions {
    companies: LookupOption[];
    departments: LookupOption[];
    roles: Option[];
    modules: Option[];
    default_modules: string[];
    can_manage_access: boolean;
    temporary_access_days: number;
}