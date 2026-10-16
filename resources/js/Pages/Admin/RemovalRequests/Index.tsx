import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import PageHeader from '@/Components/UI/PageHeader';
import Table, { EmptyRow, rowActionClass, rowDangerActionClass, TBody, Td, Th, THead, Tr } from '@/Components/UI/Table';
import Textarea from '@/Components/UI/Textarea';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { UserMinus } from 'lucide-react';
import { useState } from 'react';

interface RemovalRequestRow {
    id: number;
    employee: string;
    username: string;
    reason: string;
    details: string | null;
    requested_by: string;
    requested_at: string;
    can_process: boolean;
}

type Mode = 'approve' | 'decline';

const absoluteFormat = new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

const relativeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function relativeTime(date: Date): string {
    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];

    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) {
            return relativeFormat.format(Math.round(seconds / size), unit);
        }
    }

    return 'just now';
}

export default function Index({ requests }: { requests: RemovalRequestRow[] }) {
    const [target, setTarget] = useState<{ request: RemovalRequestRow; mode: Mode } | null>(null);
    const [note, setNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const close = () => {
        setTarget(null);
        setNote('');
    };

    const submit = () => {
        if (!target) return;

        const routeName = target.mode === 'approve' ? 'admin.removal-requests.approve' : 'admin.removal-requests.decline';

        router.post(route(routeName, target.request.id), target.mode === 'decline' ? { decision_note: note } : {}, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onSuccess: close,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AdminLayout title="Removal requests">
            <Head title="Removal requests" />

            <PageHeader
                eyebrow="People"
                title="Removal requests"
                description="Requests from HR to remove resigned, AWOL or separated employees. Approving a request disables the account immediately."
            />

            <Table
                footer={
                    requests.length > 0 && (
                        <p className="tabular text-[13px] text-stone-500">
                            <span className="font-medium text-ink">{requests.length}</span> pending{' '}
                            {requests.length === 1 ? 'request' : 'requests'}
                        </p>
                    )
                }
            >
                <THead>
                    <Th>Employee</Th>
                    <Th>Reason</Th>
                    <Th>Requested by</Th>
                    <Th>Requested</Th>
                    <Th align="right">
                        <span className="sr-only">Actions</span>
                    </Th>
                </THead>
                <TBody>
                    {requests.map((r) => {
                        const requestedAt = new Date(r.requested_at);

                        return (
                            <Tr key={r.id}>
                                <Td className="whitespace-nowrap">
                                    <div className="font-medium text-ink">{r.employee}</div>
                                    <div className="font-mono text-[13px] text-stone-500">{r.username}</div>
                                </Td>
                                <Td className="min-w-[14rem] max-w-md">
                                    <div className="text-ink">{r.reason}</div>
                                    {r.details && (
                                        <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-stone-500" title={r.details}>
                                            {r.details}
                                        </p>
                                    )}
                                </Td>
                                <Td className="whitespace-nowrap">{r.requested_by}</Td>
                                <Td className="whitespace-nowrap">
                                    <time dateTime={r.requested_at} title={absoluteFormat.format(requestedAt)}>
                                        <span className="block text-stone-700">{relativeTime(requestedAt)}</span>
                                        <span className="tabular block text-[13px] text-stone-500">
                                            {absoluteFormat.format(requestedAt)}
                                        </span>
                                    </time>
                                </Td>
                                <Td align="right" className="whitespace-nowrap">
                                    {r.can_process && (
                                        <div className="flex justify-end gap-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setTarget({ request: r, mode: 'decline' })}
                                                className={rowActionClass}
                                            >
                                                Decline
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTarget({ request: r, mode: 'approve' })}
                                                className={rowDangerActionClass}
                                            >
                                                Approve and deactivate
                                            </button>
                                        </div>
                                    )}
                                </Td>
                            </Tr>
                        );
                    })}

                    {requests.length === 0 && (
                        <EmptyRow
                            colSpan={5}
                            icon={UserMinus}
                            title="No pending removal requests"
                            hint="Requests appear here when HR asks for an employee's account to be removed."
                        />
                    )}
                </TBody>
            </Table>

            {target && (
                <ConfirmDialog
                    open
                    title={
                        target.mode === 'approve'
                            ? `Deactivate ${target.request.employee}?`
                            : `Decline the request for ${target.request.employee}?`
                    }
                    description={
                        target.mode === 'approve'
                            ? 'Access is removed immediately and the user is signed out of every device.'
                            : 'The account stays as it is. You can leave a note for the requester.'
                    }
                    confirmLabel={target.mode === 'approve' ? 'Deactivate' : 'Decline request'}
                    variant={target.mode === 'approve' ? 'danger' : 'primary'}
                    processing={processing}
                    onConfirm={submit}
                    onCancel={close}
                >
                    {target.mode === 'approve' ? (
                        <dl className="space-y-1 rounded-md border border-line bg-paper px-3.5 py-3 text-[13px]">
                            <div className="flex gap-2">
                                <dt className="w-24 shrink-0 text-stone-500">Reason</dt>
                                <dd className="text-ink">{target.request.reason}</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="w-24 shrink-0 text-stone-500">Requested by</dt>
                                <dd className="text-ink">{target.request.requested_by}</dd>
                            </div>
                        </dl>
                    ) : (
                        <Textarea
                            label="Note to requester"
                            id="decision-note"
                            name="decision_note"
                            optional
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            hint="Explain why the account should stay active."
                        />
                    )}
                </ConfirmDialog>
            )}
        </AdminLayout>
    );
}
