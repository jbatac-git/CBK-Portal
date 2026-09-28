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
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: AuthUser;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
};