import FormActions from '@/Components/UI/FormActions';
import Card, { CardBody, CardHeader } from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import { Employee, UserFormOptions } from '@/types/user';
import { useForm } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { FormEventHandler } from 'react';

/**
 * Mirrors UsernameGenerator on the server: first initial + last name + last
 * 2 digits of the Employee ID. The server still decides the final username
 * (it widens the digits when a username is already taken).
 */
function usernamePreview(firstName: string, lastName: string, employeeId: string): string | null {
    const clean = (value: string) =>
        value
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

    const first = clean(firstName);
    const last = clean(lastName);
    const digits = employeeId.replace(/\D/g, '');

    if (!first || !last || digits.length < 2) return null;

    return `${first[0]}${last}${digits.slice(-2)}`;
}

interface UserFormProps {
    options: UserFormOptions;
    /** Present = edit mode. Absent = create mode. */
    employee?: Employee;
}

export default function UserForm({ options, employee }: UserFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        first_name: employee?.first_name ?? '',
        middle_name: employee?.middle_name ?? '',
        last_name: employee?.last_name ?? '',
        employee_id: employee?.employee_id ?? '',
        email: employee?.email ?? '',
        company_id: employee ? String(employee.company_id) : '',
        department_id: employee?.department_id ? String(employee.department_id) : '',
        role: options.roles.find((r) => r.value === 'Diser')?.value ?? options.roles[0]?.value ?? '',
        modules: employee?.modules ?? options.default_modules,
    });

    const previewUsername = employee ? null : usernamePreview(data.first_name, data.last_name, data.employee_id);
    const currentRole = employee ? employee.role : data.role;
    const isDiser = currentRole === 'Diser';
    const showModules = isDiser && options.can_manage_access;

    const toggleModule = (value: string, checked: boolean) =>
        setData('modules', checked ? [...data.modules, value] : data.modules.filter((m) => m !== value));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (employee) {
            put(route('admin.users.update', employee.id));
        } else {
            post(route('admin.users.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {!employee && (
                <div className="flex gap-3 rounded-lg border border-gold-200 bg-gold-50 px-4 py-3 text-[13px] leading-relaxed text-stone-700">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
                    <p>
                        The username and a temporary password are generated automatically and emailed to the employee.
                        Temporary access is valid for{' '}
                        <span className="tabular font-medium text-ink">{options.temporary_access_days} days</span>.
                    </p>
                </div>
            )}

            {employee && (
                <Card>
                    <dl className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        <div className="px-5 py-4">
                            <dt className="eyebrow">Username</dt>
                            <dd className="mt-1.5 truncate font-mono text-sm text-ink">{employee.username}</dd>
                        </div>
                        <div className="px-5 py-4">
                            <dt className="eyebrow">Employee ID</dt>
                            <dd className="tabular mt-1.5 font-mono text-sm text-ink">{employee.employee_id}</dd>
                        </div>
                        <div className="px-5 py-4">
                            <dt className="eyebrow">Role</dt>
                            <dd className="mt-1.5 text-sm font-medium text-ink">{employee.role ?? '—'}</dd>
                        </div>
                    </dl>
                </Card>
            )}

            <Card>
                <CardHeader title="Identity" description="The employee's legal name and the email address their credentials are sent to." />
                <CardBody className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-3">
                        <Input
                            label="First name"
                            name="first_name"
                            autoComplete="off"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            error={errors.first_name}
                        />
                        <Input
                            label="Middle name"
                            name="middle_name"
                            optional
                            autoComplete="off"
                            value={data.middle_name}
                            onChange={(e) => setData('middle_name', e.target.value)}
                            error={errors.middle_name}
                        />
                        <Input
                            label="Last name"
                            name="last_name"
                            autoComplete="off"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            error={errors.last_name}
                        />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {!employee && (
                            <Input
                                label="Employee ID"
                                name="employee_id"
                                autoComplete="off"
                                autoCapitalize="characters"
                                spellCheck={false}
                                placeholder="e.g. CBK-2024-0153"
                                className="tabular font-mono uppercase"
                                value={data.employee_id}
                                onChange={(e) => setData('employee_id', e.target.value)}
                                error={errors.employee_id}
                                hint={
                                    previewUsername ? (
                                        <>
                                            Username will be <span className="font-mono font-medium text-ink">{previewUsername}</span>
                                            {' '}(more digits are added if it is already taken). The ID can't be edited later.
                                        </>
                                    ) : (
                                        'Enter the full ID as on the employee’s records. The username uses its last 2 digits.'
                                    )
                                }
                            />
                        )}
                        <Input
                            label="Email address"
                            name="email"
                            type="email"
                            autoComplete="off"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            hint={employee ? undefined : 'Login details are sent here.'}
                        />
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader title="Employment" description="Where the employee works and what kind of account they need." />
                <CardBody className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Select
                            label="Company"
                            name="company_id"
                            value={data.company_id}
                            onChange={(e) => setData('company_id', e.target.value)}
                            error={errors.company_id}
                        >
                            <option value="">Select a company</option>
                            {options.companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Department"
                            name="department_id"
                            optional={isDiser}
                            value={data.department_id}
                            onChange={(e) => setData('department_id', e.target.value)}
                            error={errors.department_id}
                        >
                            <option value="">{isDiser ? 'None' : 'Select a department'}</option>
                            {options.departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {!employee && (
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Select
                                label="Role"
                                name="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                error={errors.role}
                                hint="Sets what the account can do in CBK Academy."
                            >
                                {options.roles.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    )}
                </CardBody>
            </Card>

            {isDiser && (
                <Card>
                    <CardHeader
                        title="Portal access"
                        description={
                            showModules
                                ? 'Choose which sections of CBK Academy this employee can open.'
                                : 'Sections of CBK Academy this employee can open.'
                        }
                    />
                    <CardBody>
                        {showModules ? (
                            <fieldset>
                                <legend className="sr-only">Portal modules</legend>
                                <div className="divide-y divide-line overflow-hidden rounded-md border border-line">
                                    {options.modules.map((m) => {
                                        const checked = data.modules.includes(m.value);

                                        return (
                                            <label
                                                key={m.value}
                                                className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-paper ${
                                                    checked ? 'text-ink' : 'text-stone-600'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={(e) => toggleModule(m.value, e.target.checked)}
                                                    className="checkbox"
                                                />
                                                <span className="font-medium">{m.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {errors.modules && <p className="mt-2 text-[13px] text-red-700">{errors.modules}</p>}
                            </fieldset>
                        ) : (
                            <p className="text-sm text-stone-600">
                                Default modules are assigned automatically. An administrator can change the access later.
                            </p>
                        )}
                    </CardBody>
                </Card>
            )}

            <FormActions cancelHref={route('admin.users.index')} submitLabel={employee ? 'Save changes' : 'Add employee'} processing={processing} />
        </form>
    );
}
