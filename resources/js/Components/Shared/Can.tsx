import { usePermission } from '@/Hooks/usePermission';
import { PropsWithChildren } from 'react';

export default function Can({ permission, children }: PropsWithChildren<{ permission: string }>) {
    const { can } = usePermission();

    return can(permission) ? <>{children}</> : null;
}