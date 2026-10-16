import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import PageHeader from '@/Components/UI/PageHeader';
import Switch from '@/Components/UI/Switch';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Check, Minus } from 'lucide-react';
import { Fragment, useState } from 'react';

interface RoleRow {
    role: string;
    editable: boolean;
    permissions: Record<string, boolean>;
}

const sections: { label: string; prefix: string }[] = [
    { label: 'User management', prefix: 'users.' },
    { label: 'Learning materials', prefix: 'learning-materials.' },
    { label: 'Price lists', prefix: 'price-lists.' },
    { label: 'Contact us', prefix: 'contact-us.' },
];

/** "learning-materials.view-drafts" → "View drafts" */
function permissionLabel(permission: string): string {
    const text = permission.split('.').slice(1).join(' ').replace(/[-_]/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function sameGrants(a: Record<string, boolean>, b: Record<string, boolean>): boolean {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].every((key) => Boolean(a[key]) === Boolean(b[key]));
}

export default function RolePermissions({ permissions, roles }: { permissions: string[]; roles: RoleRow[] }) {
    const [state, setState] = useState<Record<string, Record<string, boolean>>>(
        Object.fromEntries(roles.map((r) => [r.role, r.permissions])),
    );
    const [saving, setSaving] = useState<string | null>(null);

    const toggle = (role: string, permission: string) => {
        setState((prev) => ({ ...prev, [role]: { ...prev[role], [permission]: !prev[role][permission] } }));
    };

    const save = (role: string) => {
        const permissions = Object.entries(state[role])
            .filter(([, v]) => v)
            .map(([k]) => k);

        router.put(
            route('admin.roles-permissions.update'),
            { role, permissions },
            {
                preserveScroll: true,
                onStart: () => setSaving(role),
                onFinish: () => setSaving(null),
            },
        );
    };

    const groups = sections
        .map((section) => ({ ...section, items: permissions.filter((p) => p.startsWith(section.prefix)) }))
        .filter((group) => group.items.length > 0);

    const isDirty = (row: RoleRow) => row.editable && !sameGrants(state[row.role] ?? {}, row.permissions);

    return (
        <AdminLayout title="Roles & permissions">
            <Head title="Roles & permissions" />

            <PageHeader
                title="Roles & permissions"
                description="Choose what Admin and HR can do. Super Admin always has full access, and Diser access is managed per employee in User management."
            />

            <div className="rounded-lg border border-line bg-white shadow-hairline">
                <div className="overflow-x-auto lg:overflow-visible">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr>
                                <th
                                    scope="col"
                                    className="rounded-tl-lg border-b border-line bg-paper px-5 py-3 text-left text-xs font-medium text-stone-500 lg:sticky lg:top-0 lg:z-10"
                                >
                                    Permission
                                </th>
                                {roles.map((row, index) => (
                                    <th
                                        key={row.role}
                                        scope="col"
                                        className={`w-36 border-b border-line bg-paper px-4 py-3 text-center align-bottom lg:sticky lg:top-0 lg:z-10 ${
                                            index === roles.length - 1 ? 'rounded-tr-lg' : ''
                                        }`}
                                    >
                                        <span className="block whitespace-nowrap text-[13px] font-semibold text-ink">{row.role}</span>
                                        <span className="mt-0.5 block whitespace-nowrap text-2xs font-normal text-stone-500">
                                            {row.editable
                                                ? 'Editable'
                                                : row.role === 'Super Admin'
                                                  ? 'Always full access'
                                                  : 'Managed per employee'}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {groups.map((group) => (
                                <Fragment key={group.label}>
                                    <tr>
                                        <th
                                            scope="colgroup"
                                            colSpan={roles.length + 1}
                                            className="border-b border-line bg-white px-5 pb-2 pt-5 text-left"
                                        >
                                            <span className="eyebrow">{group.label}</span>
                                        </th>
                                    </tr>
                                    {group.items.map((permission) => (
                                        <tr key={permission} className="border-b border-line/70 transition-colors hover:bg-paper/70">
                                            <th scope="row" className="px-5 py-3 text-left font-normal">
                                                <span className="block text-sm text-ink" title={permission}>{permissionLabel(permission)}</span>
                                            </th>
                                            {roles.map((row) => (
                                                <td key={row.role} className="px-4 py-2.5 text-center">
                                                    {row.editable ? (
                                                        <Switch
                                                            label={`${row.role}: ${permissionLabel(permission)}`}
                                                            checked={state[row.role]?.[permission] ?? false}
                                                            onChange={() => toggle(row.role, permission)}
                                                            disabled={saving === row.role}
                                                        />
                                                    ) : row.role === 'Super Admin' ? (
                                                        <Check className="mx-auto h-4 w-4 text-stone-400" aria-label="Always allowed" />
                                                    ) : (
                                                        <Minus className="mx-auto h-4 w-4 text-stone-300" aria-label="Managed per employee" />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </Fragment>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr>
                                <td className="rounded-bl-lg bg-paper px-5 py-3 text-[13px] text-stone-500">
                                    Each role is saved separately.
                                </td>
                                {roles.map((row, index) => (
                                    <td
                                        key={row.role}
                                        className={`bg-paper px-4 py-3 text-center ${index === roles.length - 1 ? 'rounded-br-lg' : ''}`}
                                    >
                                        {row.editable && (
                                            <div className="flex flex-col items-center gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant={isDirty(row) ? 'primary' : 'secondary'}
                                                    onClick={() => save(row.role)}
                                                    loading={saving === row.role}
                                                    aria-label={`Save ${row.role} permissions`}
                                                >
                                                    Save changes
                                                </Button>
                                                {isDirty(row) && <Badge tone="warning">Unsaved</Badge>}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
