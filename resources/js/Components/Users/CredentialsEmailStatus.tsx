import { CredentialsEmail } from '@/types/user';
import { CircleAlert, CircleCheck, Clock } from 'lucide-react';

interface CredentialsEmailStatusProps {
    email: CredentialsEmail;
    /** "detail" also prints the mail server's error message under a failure. */
    variant?: 'compact' | 'detail';
}

function formatSentAt(iso: string): string {
    const date = new Date(iso);
    const sameDay = date.toDateString() === new Date().toDateString();

    return new Intl.DateTimeFormat('en-PH', sameDay ? { hour: 'numeric', minute: '2-digit' } : { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

/** Shows whether the employee's login details email was delivered. */
export default function CredentialsEmailStatus({ email, variant = 'compact' }: CredentialsEmailStatusProps) {
    if (email.status === 'sent') {
        return (
            <span className="inline-flex items-center gap-1 text-2xs text-emerald-700" title="Login details email delivered to the mail server">
                <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Email sent{email.sent_at && <span className="tabular text-stone-500">· {formatSentAt(email.sent_at)}</span>}
            </span>
        );
    }

    if (email.status === 'queued') {
        return (
            <span className="inline-flex items-center gap-1 text-2xs text-stone-500" title={email.error ?? 'Waiting to be sent'}>
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {email.error ? 'Email retrying…' : 'Email sending…'}
            </span>
        );
    }

    return (
        <span className="inline-flex flex-col items-start gap-1">
            <span className="inline-flex items-center gap-1 text-2xs font-medium text-red-700" title={email.error ?? undefined}>
                <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                Email not delivered
            </span>
            {variant === 'detail' && (
                <span className="text-[13px] leading-relaxed text-stone-600">
                    {email.error ?? 'The mail server did not accept the message.'} Use “Re-send credentials” after the problem is fixed.
                </span>
            )}
        </span>
    );
}
