import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
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

        const routeName =
            target.mode === 'approve' ? 'admin.removal-requests.approve' : 'admin.removal-requests.decline';

        router.post(
            route(routeName, target.request.id),
            target.mode === 'decline' ? { decision_note: note } : {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onSuccess: close,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AdminLayout title="Removal Requests">
            <Head title="Removal Requests" />

            <p className="text-sm text-stone-600">
                Requests sent by HR for resigned, AWOL or separated employees. Approving a request disables the
                account immediately.
            </p>

            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-medium">Employee</th>
                            <th scope="col" className="px-4 py-3 font-medium">Reason</th>
                            <th scope="col" className="px-4 py-3 font-medium">Requested by</th>
                            <th scope="col" className="px-4 py-3 font-medium">Date</th>
                            <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {requests.map((r) => (
                            <tr key={r.id}>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-stone-900">{r.employee}</div>
                                    <div className="text-xs text-stone-500">{r.username}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-stone-800">{r.reason}</div>
                                    {r.details && <div className="text-xs text-stone-500">{r.details}</div>}
                                </td>
                                <td className="px-4 py-3 text-stone-700">{r.requested_by}</td>
                                <td className="px-4 py-3 text-stone-700">
                                    {new Date(r.requested_at).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {r.can_process && (
                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setTarget({ request: r, mode: 'approve' })}
                                                className="text-red-700 underline"
                                            >
                                                Approve &amp; deactivate
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTarget({ request: r, mode: 'decline' })}
                                                className="text-stone-600 underline"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {requests.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-stone-500">
                                    No pending removal requests.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                    {target.mode === 'decline' && (
                        <div>
                            <label htmlFor="decision-note" className="block text-sm font-medium text-stone-700">
                                Note (optional)
                            </label>
                            <textarea
                                id="decision-note"
                                rows={3}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-maroon focus:ring-maroon"
                            />
                        </div>
                    )}
                </ConfirmDialog>
            )}
        </AdminLayout>
    );
}