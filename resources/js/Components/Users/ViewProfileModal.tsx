import Avatar from '@/Components/Shared/Avatar';
import Button from '@/Components/UI/Button';
import StatusBadge from '@/Components/Shared/StatusBadge';
import { Employee } from '@/types/user';
import { useEffect, useRef } from 'react';

export default function ViewProfileModal({
    employee,
    onClose,
}: {
    employee: Employee | null;
    onClose: () => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;

        if (employee && !dialog.open) dialog.showModal();
        if (!employee && dialog.open) dialog.close();
    }, [employee]);

    if (!employee) return null;

    const rows: [string, string][] = [
        ['Username', employee.username],
        ['Employee ID', employee.employee_id],
        ['Email', employee.email],
        ['Contact number', employee.contact_number ?? '—'],
        ['Company', employee.company ?? '—'],
        ['Department', employee.department ?? '—'],
        ['Role', employee.role ?? '—'],
    ];

    return (
        <dialog
            ref={ref}
            onCancel={(e) => {
                e.preventDefault();
                onClose();
            }}
            className="w-full max-w-md rounded-xl p-0 backdrop:bg-black/40"
        >
            <div className="space-y-4 p-6">
                <div className="flex items-center gap-4">
                    <Avatar name={employee.name} photoUrl={employee.photo_url} size="lg" />
                    <div>
                        <h2 className="text-lg font-medium text-maroon">{employee.name}</h2>
                        <StatusBadge status={employee.status} label={employee.status_label} />
                    </div>
                </div>

                <dl className="divide-y divide-stone-100 text-sm">
                    {rows.map(([label, value]) => (
                        <div key={label} className="flex justify-between py-2">
                            <dt className="text-stone-500">{label}</dt>
                            <dd className="font-medium text-stone-800">{value}</dd>
                        </div>
                    ))}
                </dl>

                <div className="flex justify-end">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </div>
        </dialog>
    );
}