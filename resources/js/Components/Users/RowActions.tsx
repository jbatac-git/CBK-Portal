
import { ButtonVariant } from '@/Components/UI/Button';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import Select from '@/Components/UI/Select';
import { Employee, Option } from '@/types/user';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

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

export default function RowActions({
    user,
    removalReasons = [],
}: RowActionsProps) {
    const [action, setAction] = useState<ActionKey | null>(null);
    const [reason, setReason] = useState(removalReasons[0]?.value ?? '');
    const [details, setDetails] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const configs: Record<ActionKey, DialogConfig> = {
        approve: {
            title: `Approve ${user.name}?`,
            description:
                'The account becomes fully active, with access based on the assigned role.',
            confirmLabel: 'Approve',
            variant: 'primary',
            routeName: 'admin.users.approve',
        },
        decline: {
            title: `Not approve ${user.name}?`,
            description:
                'The account becomes restricted and can no longer access the portal.',
            confirmLabel: 'Not approve',
            variant: 'danger',
            routeName: 'admin.users.decline',
        },
        deactivate: {
            title: `Deactivate ${user.name}?`,
            description:
                'Access is removed immediately and the user is signed out of every device.',
            confirmLabel: 'Deactivate',
            variant: 'danger',
            routeName: 'admin.users.deactivate',
        },
        resend: {
            title: `Re-send credentials to ${user.name}?`,
            description:
                'A new temporary password is generated and emailed. The old one stops working.',
            confirmLabel: 'Re-send',
            variant: 'primary',
            routeName: 'admin.users.resend-credentials',
        },
        removal: {
            title: `Request removal of ${user.name}?`,
            description:
                'The administrators will be notified and will disable the account.',
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

        const payload =
            action === 'removal'
                ? { reason, details }
                : {};

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
            <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-sm">
                {user.can_update && (
                    <Link
                        href={route('admin.users.edit', user.id)}
                        className="text-maroon underline"
                    >
                        Edit
                    </Link>
                )}

                {user.can_approve && (
                    <button
                        type="button"
                        onClick={() => open('approve')}
                        className="text-green-700 underline"
                    >
                        Approve
                    </button>
                )}

                {user.can_decline && (
                    <button
                        type="button"
                        onClick={() => open('decline')}
                        className="text-red-700 underline"
                    >
                        Not approve
                    </button>
                )}

                {user.can_resend_credentials && (
                    <button
                        type="button"
                        onClick={() => open('resend')}
                        className="text-stone-600 underline"
                    >
                        Re-send credentials
                    </button>
                )}

                {user.can_request_removal && (
                    <button
                        type="button"
                        onClick={() => open('removal')}
                        className="text-red-700 underline"
                    >
                        Request removal
                    </button>
                )}

                {user.can_deactivate && (
                    <button
                        type="button"
                        onClick={() => open('deactivate')}
                        className="text-red-700 underline"
                    >
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
                        <div className="space-y-3">
                            <Select
                                label="Reason"
                                name="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                error={errors.reason}
                            >
                                {removalReasons.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </Select>

                            <div>
                                <label
                                    htmlFor={`details-${user.id}`}
                                    className="block text-sm font-medium text-stone-700"
                                >
                                    Details (optional)
                                </label>

                                <textarea
                                    id={`details-${user.id}`}
                                    rows={3}
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-maroon focus:ring-maroon"
                                />

                                {errors.details && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.details}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </ConfirmDialog>
            )}
        </>
    );
}
