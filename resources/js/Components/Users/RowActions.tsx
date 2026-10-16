import { ButtonVariant } from '@/Components/UI/Button';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import Select from '@/Components/UI/Select';
import { rowActionClass, rowDangerActionClass } from '@/Components/UI/Table';
import Textarea from '@/Components/UI/Textarea';
import { Employee, Option } from '@/types/user';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

// Same shape as rowActionClass, in the brand colour for the positive action.
const approveActionClass = rowActionClass.replace('text-stone-600 ', 'text-maroon-700 ').replace('hover:bg-stone-100 hover:text-ink', 'hover:bg-maroon-50');

type ActionKey = 'approve' | 'decline' | 'deactivate' | 'resend' | 'removal';

interface DialogConfig {
    title: string;
    description: string;
    confirmLabel: string;
    variant: ButtonVariant;
    routeName: string;
}

interface RowActionsProps {
    user: Employee;
    removalReasons?: Option[];
}

export default function RowActions({ user, removalReasons = [] }: RowActionsProps) {
    const [action, setAction] = useState<ActionKey | null>(null);
    const [reason, setReason] = useState(removalReasons[0]?.value ?? '');
    const [details, setDetails] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const configs: Record<ActionKey, DialogConfig> = {
        approve: {
            title: `Approve ${user.name}?`,
            description: 'The account becomes fully active, with access based on the assigned role.',
            confirmLabel: 'Approve',
            variant: 'primary',
            routeName: 'admin.users.approve',
        },
        decline: {
            title: `Not approve ${user.name}?`,
            description: 'The account becomes restricted and can no longer access the portal.',
            confirmLabel: 'Not approve',
            variant: 'danger',
            routeName: 'admin.users.decline',
        },
        deactivate: {
            title: `Deactivate ${user.name}?`,
            description: 'Access is removed immediately and the user is signed out of every device.',
            confirmLabel: 'Deactivate',
            variant: 'danger',
            routeName: 'admin.users.deactivate',
        },
        resend: {
            title: `Re-send credentials to ${user.name}?`,
            description: 'A new temporary password is generated and emailed. The old one stops working.',
            confirmLabel: 'Re-send',
            variant: 'primary',
            routeName: 'admin.users.resend-credentials',
        },
        removal: {
            title: `Request removal of ${user.name}?`,
            description: 'The administrators will be notified and will disable the account.',
            confirmLabel: 'Send request',
            variant: 'danger',
            routeName: 'admin.users.removal-request',
        },
    };

    const open = (key: ActionKey) => {
        setErrors({});
        setAction(key);
    };

    const confirm = () => {
        if (!action) {
            return;
        }

        const payload = action === 'removal' ? { removal_reason_id: reason, details } : {};

        router.post(route(configs[action].routeName, user.id), payload, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onSuccess: () => setAction(null),
            onError: (e) => setErrors(e),
            onFinish: () => setProcessing(false),
        });
    };

    const config = action ? configs[action] : null;

    return (
        <>
            <div className="flex flex-wrap items-center justify-end gap-0.5 whitespace-nowrap">
                {user.can_approve && (
                    <button type="button" onClick={() => open('approve')} className={approveActionClass}>
                        Approve
                    </button>
                )}

                {user.can_decline && (
                    <button type="button" onClick={() => open('decline')} className={rowDangerActionClass}>
                        Not approve
                    </button>
                )}

                {user.can_update && (
                    <Link href={route('admin.users.edit', user.id)} className={rowActionClass}>
                        Edit
                    </Link>
                )}

                {user.can_resend_credentials && (
                    <button type="button" onClick={() => open('resend')} className={rowActionClass}>
                        Re-send credentials
                    </button>
                )}

                {user.can_request_removal && (
                    <button type="button" onClick={() => open('removal')} className={rowDangerActionClass}>
                        Request removal
                    </button>
                )}

                {user.can_deactivate && (
                    <button type="button" onClick={() => open('deactivate')} className={rowDangerActionClass}>
                        Deactivate
                    </button>
                )}
            </div>

            {config && (
                <ConfirmDialog
                    open
                    title={config.title}
                    description={config.description}
                    confirmLabel={config.confirmLabel}
                    variant={config.variant}
                    processing={processing}
                    onConfirm={confirm}
                    onCancel={() => setAction(null)}
                >
                    {action === 'removal' && (
                        <div className="space-y-4 text-left">
                            <Select
                                label="Reason"
                                id={`removal-reason-${user.id}`}
                                name="removal_reason_id"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                error={errors.removal_reason_id}
                            >
                                {removalReasons.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </Select>

                            <Textarea
                                label="Details"
                                optional
                                id={`removal-details-${user.id}`}
                                name="details"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                error={errors.details}
                                hint="Last working day, turnover notes or anything the administrator should know."
                            />
                        </div>
                    )}
                </ConfirmDialog>
            )}
        </>
    );
}
