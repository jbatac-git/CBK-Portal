import Avatar from '@/Components/Shared/Avatar';
import StatusBadge from '@/Components/Shared/StatusBadge';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { PanelBody, PanelFooter, PanelHeader, PanelSection } from '@/Components/UI/SidePanel';
import CredentialsEmailStatus from '@/Components/Users/CredentialsEmailStatus';
import { AccountActionKey, useAccountActions } from '@/Components/Users/useAccountActions';
import { Employee, Option } from '@/types/user';
import { Check, ChevronRight, Clock, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface EmployeeDetailsProps {
    employee: Employee;
    removalReasons: Option[];
    /** Portal module labels, to show a Diser's access. */
    modules: Option[];
    onEdit: () => void;
    onClose: () => void;
}

const dash = <span className="text-stone-400">—</span>;
const mono = (value: string) => <span className="font-mono text-[13px]">{value}</span>;

function Facts({ rows }: { rows: [string, ReactNode][] }) {
    return (
        <dl className="divide-y divide-line/80 rounded-md border border-line">
            {rows.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm">
                    <dt className="shrink-0 text-stone-500">{label}</dt>
                    <dd className="min-w-0 break-words text-right text-ink">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

/** Everything about one employee, their access and every action, in the side panel. */
export default function EmployeeDetails({ employee, removalReasons, modules, onEdit, onClose }: EmployeeDetailsProps) {
    const { configs, start, dialog } = useAccountActions(employee, removalReasons);

    const pendingDecision = employee.can_approve || employee.can_decline;
    const otherActions = (['resend', 'removal', 'deactivate'] as AccountActionKey[]).filter((key) => configs[key].available);
    const isDiser = employee.role === 'Diser';
    const days = employee.temporary_days_left;

    return (
        <>
            <PanelHeader
                leading={
                    <Avatar
                        name={employee.name}
                        photoUrl={employee.photo_url}
                        firstName={employee.first_name}
                        lastName={employee.last_name}
                        size="md"
                    />
                }
                title={employee.name}
                description={<span className="break-all">{employee.email}</span>}
                meta={
                    <>
                        <StatusBadge status={employee.status} label={employee.status_label} />
                        {days !== null && (
                            <span className={`tabular text-[13px] ${days <= 2 ? 'font-medium text-gold-700' : 'text-stone-500'}`}>
                                {days} {days === 1 ? 'day' : 'days'} left
                            </span>
                        )}
                        {employee.has_pending_removal && <Badge tone="warning">Removal pending</Badge>}
                    </>
                }
            />

            <PanelBody>
                {pendingDecision && (
                    <PanelSection>
                        <div className="rounded-lg border border-gold-200 bg-gold-50 p-4">
                            <div className="flex gap-3">
                                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-ink">Waiting for approval</p>
                                    <p className="mt-0.5 text-[13px] text-stone-600">
                                        {days !== null
                                            ? `Temporary access ends in ${days} ${days === 1 ? 'day' : 'days'}. Approve to keep the account active.`
                                            : 'Approve to make the account fully active.'}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {employee.can_approve && (
                                            <Button size="sm" variant="secondary" onClick={() => start('approve')}>
                                                <Check aria-hidden="true" />
                                                Approve
                                            </Button>
                                        )}
                                        {employee.can_decline && (
                                            <Button size="sm" variant="ghost" onClick={() => start('decline')} className="text-red-700 hover:bg-red-50 hover:text-red-800">
                                                Not approve
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PanelSection>
                )}

                {employee.credentials_email && (
                    <PanelSection title="Login details email">
                        <CredentialsEmailStatus email={employee.credentials_email} variant="detail" />
                    </PanelSection>
                )}

                <PanelSection title="Account">
                    <Facts
                        rows={[
                            ['Username', mono(employee.username)],
                            ['Employee ID', mono(employee.employee_id)],
                            ['Role', employee.role ?? dash],
                        ]}
                    />
                </PanelSection>

                <PanelSection title="Contact and employment">
                    <Facts
                        rows={[
                            ['Contact number', employee.contact_number ? mono(employee.contact_number) : dash],
                            ['Company', employee.company ?? dash],
                            ['Department', employee.department ?? dash],
                        ]}
                    />
                </PanelSection>

                {isDiser && employee.modules && (
                    <PanelSection title="Portal access" description="Sections of CBK Academy this employee can open.">
                        <ul className="divide-y divide-line/80 rounded-md border border-line">
                            {modules.map((m) => {
                                const allowed = employee.modules?.includes(m.value) ?? false;
                                const Icon = allowed ? Check : Minus;

                                return (
                                    <li key={m.value} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                                        <span className={allowed ? 'text-ink' : 'text-stone-500'}>{m.label}</span>
                                        <span className={`inline-flex items-center gap-1.5 text-[13px] ${allowed ? 'text-emerald-700' : 'text-stone-400'}`}>
                                            <Icon className="h-4 w-4" aria-hidden="true" />
                                            {allowed ? 'Allowed' : 'No access'}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </PanelSection>
                )}

                {otherActions.length > 0 && (
                    <PanelSection title="Account actions">
                        <ul className="divide-y divide-line/80 overflow-hidden rounded-md border border-line">
                            {otherActions.map((key) => {
                                const action = configs[key];
                                const danger = action.variant === 'danger';

                                return (
                                    <li key={key}>
                                        <button
                                            type="button"
                                            onClick={() => start(key)}
                                            className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:bg-paper focus-visible:outline-none ${
                                                danger ? 'hover:bg-red-50/60' : 'hover:bg-paper'
                                            }`}
                                        >
                                            <span className="min-w-0 flex-1">
                                                <span className={`block text-sm font-medium ${danger ? 'text-red-700' : 'text-ink'}`}>{action.label}</span>
                                                <span className="mt-0.5 block text-[13px] text-stone-500">{action.summary}</span>
                                            </span>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </PanelSection>
                )}
            </PanelBody>

            <PanelFooter>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                {employee.can_update && <Button onClick={onEdit}>Edit details</Button>}
            </PanelFooter>

            {dialog}
        </>
    );
}
