import Button, { buttonClass } from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import { Employee, UserFormOptions } from '@/types/user';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface UserFormProps {
    options: UserFormOptions;
    /** Present = edit mode. Absent = create mode. */
    employee?: Employee;
}

const card = 'rounded-xl border border-stone-200 bg-white p-5';

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
                <div className="rounded-lg border border-gold/50 bg-gold/10 p-4 text-sm text-stone-700">
                    The username and a temporary password are generated automatically and emailed to the employee.
                    Temporary access is valid for {options.temporary_access_days} days.
                </div>
            )}

            {employee && (
                <dl className={`${card} grid gap-4 text-sm sm:grid-cols-3`}>
                    <div>
                        <dt className="text-stone-500">Username</dt>
                        <dd className="font-medium text-stone-900">{employee.username}</dd>
                    </div>
                    <div>
                        <dt className="text-stone-500">Employee ID</dt>
                        <dd className="font-medium text-stone-900">{employee.employee_id}</dd>
                    </div>
                    <div>
                        <dt className="text-stone-500">Role</dt>
                        <dd className="font-medium text-stone-900">{employee.role ?? '—'}</dd>
                    </div>
                </dl>
            )}

            <section className={`${card} space-y-4`}>
                <h2 className="text-base font-medium text-maroon">Employee information</h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Input label="First name" name="first_name" value={data.first_name}
                        onChange={(e) => setData('first_name', e.target.value)} error={errors.first_name} />
                    <Input label="Middle name (optional)" name="middle_name" value={data.middle_name}
                        onChange={(e) => setData('middle_name', e.target.value)} error={errors.middle_name} />
                    <Input label="Last name" name="last_name" value={data.last_name}
                        onChange={(e) => setData('last_name', e.target.value)} error={errors.last_name} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {!employee && (
                        <Input label="Employee ID number" name="employee_id" inputMode="numeric"
                            value={data.employee_id}
                            onChange={(e) => setData('employee_id', e.target.value)} error={errors.employee_id} />
                    )}
                    <Input label="Email address" name="email" type="email" value={data.email}
                        onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Select label="Company" name="company_id" value={data.company_id}
                        onChange={(e) => setData('company_id', e.target.value)} error={errors.company_id}>
                        <option value="">Select a company</option>
                        {options.companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>

                    <Select label={`Department${isDiser ? ' (optional)' : ''}`} name="department_id"
                        value={data.department_id}
                        onChange={(e) => setData('department_id', e.target.value)} error={errors.department_id}>
                        <option value="">{isDiser ? 'None' : 'Select a department'}</option>
                        {options.departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </Select>
                </div>
            </section>

            {!employee && (
                <section className={`${card} space-y-4`}>
                    <h2 className="text-base font-medium text-maroon">Role</h2>
                    <Select label="Role" name="role" value={data.role}
                        onChange={(e) => setData('role', e.target.value)} error={errors.role}>
                        {options.roles.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </Select>
                </section>
            )}

            {isDiser && (
                <section className={`${card} space-y-3`}>
                    <h2 className="text-base font-medium text-maroon">Portal modules</h2>

                    {showModules ? (
                        <fieldset className="space-y-2">
                            <legend className="sr-only">Portal modules</legend>
                            {options.modules.map((m) => (
                                <label key={m.value} className="flex items-center gap-2 text-sm text-stone-700">
                                    <input
                                        type="checkbox"
                                        checked={data.modules.includes(m.value)}
                                        onChange={(e) => toggleModule(m.value, e.target.checked)}
                                        className="rounded border-stone-300 text-maroon focus:ring-maroon"
                                    />
                                    {m.label}
                                </label>
                            ))}
                            {errors.modules && <p className="text-sm text-red-600">{errors.modules}</p>}
                        </fieldset>
                    ) : (
                        <p className="text-sm text-stone-600">
                            Default modules are assigned automatically. An administrator can change the access later.
                        </p>
                    )}
                </section>
            )}

            <div className="flex justify-end gap-3">
                <Link href={route('admin.users.index')} className={buttonClass('secondary')}>
                    Cancel
                </Link>
                <Button type="submit" disabled={processing}>
                    {employee ? 'Save changes' : 'Create account'}
                </Button>
            </div>
        </form>
    );
}