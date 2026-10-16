import Avatar from '@/Components/Shared/Avatar';
import StatusBadge from '@/Components/Shared/StatusBadge';
import Button from '@/Components/UI/Button';
import { Employee } from '@/types/user';
import { X } from 'lucide-react';
import { ReactNode, useEffect, useRef } from 'react';

interface ViewProfileModalProps {
    employee: Employee | null;
    onClose: () => void;
}

export default function ViewProfileModal({ employee, onClose }: ViewProfileModalProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;

        if (employee && !dialog.open) dialog.showModal();
        if (!employee && dialog.open) dialog.close();
    }, [employee]);

    if (!employee) return null;

    const dash = <span className="text-stone-400">—</span>;
    const mono = (value: string) => <span className="font-mono text-[13px]">{value}</span>;

    const sections: { heading: string; rows: [string, ReactNode][] }[] = [
        {
            heading: 'Account',
            rows: [
                ['Username', mono(employee.username)],
                ['Employee ID', mono(employee.employee_id)],
                ['Role', employee.role ?? dash],
            ],
        },
        {
            heading: 'Contact',
            rows: [
                ['Email', <span className="break-all">{employee.email}</span>],
                ['Contact number', employee.contact_number ? mono(employee.contact_number) : dash],
            ],
        },
        {
            heading: 'Employment',
            rows: [
                ['Company', employee.company ?? dash],
                ['Department', employee.department ?? dash],
            ],
        },
    ];

    return (
        <dialog
            ref={ref}
            aria-labelledby="profile-dialog-title"
            onCancel={(e) => {
                e.preventDefault();
                onClose();
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            className="w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-white p-0 shadow-overlay backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] open:animate-rise-in"
        >
            <div className="flex items-start gap-4 border-b border-line px-6 py-5">
                <Avatar
                    name={employee.name}
                    photoUrl={employee.photo_url}
                    firstName={employee.first_name}
                    lastName={employee.last_name}
                    size="md"
                />
                <div className="min-w-0 flex-1">
                    <h2 id="profile-dialog-title" className="truncate text-base font-semibold text-ink">
                        {employee.name}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <StatusBadge status={employee.status} label={employee.status_label} />
                        {employee.temporary_days_left !== null && (
                            <span className="tabular text-[13px] text-stone-500">
                                {employee.temporary_days_left} {employee.temporary_days_left === 1 ? 'day' : 'days'} left
                            </span>
                        )}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="-mr-2 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-ink"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="space-y-5 px-6 py-5">
                {sections.map((section) => (
                    <section key={section.heading}>
                        <h3 className="eyebrow mb-1.5">{section.heading}</h3>
                        <dl className="divide-y divide-line/80">
                            {section.rows.map(([label, value]) => (
                                <div key={label} className="flex items-baseline justify-between gap-4 py-2 text-sm">
                                    <dt className="shrink-0 text-stone-500">{label}</dt>
                                    <dd className="min-w-0 text-right text-ink">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                ))}
            </div>

            <div className="flex justify-end gap-2 rounded-b-xl border-t border-line bg-paper px-6 py-3.5">
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </div>
        </dialog>
    );
}
