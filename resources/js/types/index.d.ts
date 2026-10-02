export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface AuthUser {
    id: number;
    name: string;
    first_name: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
    status: string;
    is_temporary: boolean;
    temporary_days_left: number | null;
    profile_photo_url: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: { user: AuthUser };
    flash: { success?: string | null; error?: string | null };
    branding: {
        logo_url: string | null;
        footer: {
            company_name: string;
            copyright: string;
            contact: string;
            website: string;
            address: string;
            features: { careers_enabled: boolean };
        };
    };
};