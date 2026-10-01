import Button from '@/Components/UI/Button';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface RoleRow {
    role: string;
    editable: boolean;
    permissions: Record<string, boolean>;
}

const sections: { label: string; prefix: string }[] = [
    { label: 'User Management', prefix: 'users.' },
    { label: 'Learning Materials', prefix: 'learning-materials.' },
    { label: 'Price Lists', prefix: 'price-lists.' },
    { label: 'Contact Us', prefix: 'contact-us.' },
];

export default function RolePermissions({ permissions, roles }: { permissions: string[]; roles: RoleRow[] }) {
    const [state, setState] = useState<Record<string, Record<string, boolean>>>(
        Object.fromEntries(roles.map((r) => [r.role, r.permissions])),
    );
    const [saving, setSaving] = useState<string | null>(null);

    const toggle = (role: string, permission: string) => {
        setState((prev) => ({ ...prev, [role]: { ...prev[role], [permission]: !prev[role][permission] } }));
    };

    const save = (role: string) => {
        const permissions = Object.entries(state[role]).filter(([, v]) => v).map(([k]) => k);

        router.put(route('admin.roles-permissions.update'), { role, permissions }, {
            preserveScroll: true,
            onStart: () => setSaving(role),
            onFinish: () => setSaving(null),
        });
    };

    return (
        <AdminLayout title="Roles & Permissions">
            <Head title="Roles & Permissions" />

            <p className="mb-4 text-sm text-stone-600">
                Super Admin always has full access and Diser access is managed per-employee in User Management.
                Only Admin and HR permissions can be changed here.
            </p>

            <div className="space-y-6">
                {roles.map((row) => (
                    <section key={row.role} className="rounded-xl border border-stone-200 bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-base font-medium text-maroon">{row.role}</h2>
                            {row.editable && (
                                <Button onClick={() => save(row.role)} disabled={saving === row.role}>
                                    {saving === row.role ? 'Saving…' : 'Save'}
                                </Button>
                            )}
                            {!row.editable && (
                                <span className="text-xs text-stone-400">
                                    {row.role === 'Super Admin' ? 'Always full access' : 'Managed per employee'}
                                </span>
                            )}
                        </div>

                        {row.editable ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {sections.map((section) => (
                                    <fieldset key={section.label} className="space-y-1">
                                        <legend className="text-xs font-medium uppercase text-stone-500">{section.label}</legend>
                                        {permissions.filter((p) => p.startsWith(section.prefix)).map((permission) => (
                                            <label key={permission} className="flex items-center gap-2 text-sm text-stone-700">
                                                <input
                                                    type="checkbox"
                                                    checked={state[row.role][permission] ?? false}
                                                    onChange={() => toggle(row.role, permission)}
                                                    className="rounded border-stone-300 text-maroon focus:ring-maroon"
                                                />
                                                {permission.split('.').slice(1).join(' ')}
                                            </label>
                                        ))}
                                    </fieldset>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-stone-500">No editable permissions on this screen.</p>
                        )}
                    </section>
                ))}
            </div>
        </AdminLayout>
    );
}