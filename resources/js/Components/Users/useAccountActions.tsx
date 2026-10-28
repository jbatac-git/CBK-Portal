import { ButtonVariant } from '@/Components/UI/Button';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import Select from '@/Components/UI/Select';
import Textarea from '@/Components/UI/Textarea';
import { Employee, Option } from '@/types/user';
import { router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

export type AccountActionKey = 'approve' | 'decline' | 'deactivate' | 'resend' | 'removal';

interface ActionConfig {
    /** Button / list label. */
    label: string;
    /** One line under the label in the panel's action list. */
    summary: string;
    title: string;
    description: string;
    confirmLabel: string;
    variant: ButtonVariant;
    routeName: string;
    /** Allowed for this account right now (server-computed ability). */
    available: boolean;
}

/**
 * The account decisions and actions for one employee (approve, not approve,
 * re-send credentials, request removal, deactivate), each confirmed in a dialog.
 * Returns which ones are allowed, a function to start one, and the dialog to render.
 */
export function useAccountActions(user: Employee, removalReasons: Option[] = []) {
    // The action stays set while its dialog fades out; `open` decides visibility.
    const [action, setAction] = useState<AccountActionKey | null>(null);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState(removalReasons[0]?.value ?? '');
    const [details, setDetails] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const configs: Record<AccountActionKey, ActionConfig> = {
        approve: {
            label: 'Approve',
            summary: 'Make the account fully active.',
            title: `Approve ${user.name}?`,
            description: 'The account becomes fully active, with access based on the assigned role.',
            confirmLabel: 'Approve',
            variant: 'primary',
            routeName: 'admin.users.approve',
            available: user.can_approve,
        },
        decline: {
            label: 'Not approve',
            summary: 'Restrict the account; it can no longer sign in.',
            title: `Not approve ${user.name}?`,
            description: 'The account becomes restricted and can no longer access CBK Academy.',
            confirmLabel: 'Not approve',
            variant: 'danger',
            routeName: 'admin.users.decline',
            available: user.can_decline,
        },
        resend: {
            label: 'Re-send credentials',
            summary: 'Email a new temporary password; the old one stops working.',
            title: `Re-send credentials to ${user.name}?`,
            description: 'A new temporary password is generated and emailed. The old one stops working.',
            confirmLabel: 'Re-send',
            variant: 'primary',
            routeName: 'admin.users.resend-credentials',
            available: user.can_resend_credentials,
        },
        removal: {
            label: 'Request removal',
            summary: 'Ask an administrator to disable this account.',
            title: `Request removal of ${user.name}?`,
            description: 'The administrators will be notified and will disable the account.',
            confirmLabel: 'Send request',
            variant: 'danger',
            routeName: 'admin.users.removal-request',
            available: user.can_request_removal,
        },
        deactivate: {
            label: 'Deactivate',
            summary: 'Remove access now and sign the employee out everywhere.',
            title: `Deactivate ${user.name}?`,
            description: 'Access is removed immediately and the user is signed out of every device.',
            confirmLabel: 'Deactivate',
            variant: 'danger',
            routeName: 'admin.users.deactivate',
            available: user.can_deactivate,
        },
    };

    const start = (key: AccountActionKey) => {
        setErrors({});
        setAction(key);
        setOpen(true);
    };

    const confirm = () => {
        if (!action) return;

        const payload = action === 'removal' ? { removal_reason_id: reason, details } : {};

        router.post(route(configs[action].routeName, user.id), payload, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onSuccess: () => setOpen(false),
            onError: (e) => setErrors(e),
            onFinish: () => setProcessing(false),
        });
    };

    const config = action ? configs[action] : null;

    const dialog: ReactNode = (
        <ConfirmDialog
            open={open}
            title={config?.title ?? ''}
            description={config?.description}
            confirmLabel={config?.confirmLabel ?? ''}
            variant={config?.variant}
            processing={processing}
            onConfirm={confirm}
            onCancel={() => setOpen(false)}
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
    );

    return { configs, start, dialog };
}
