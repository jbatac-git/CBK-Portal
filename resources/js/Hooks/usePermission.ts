import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePermission() {
    const { auth } = usePage<PageProps>().props;

    const can = (permission: string): boolean =>
        auth.user.permissions.includes(permission);

    return { user: auth.user, can };
}