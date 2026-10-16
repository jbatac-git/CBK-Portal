import Badge, { BadgeTone } from '@/Components/UI/Badge';

const tones: Record<string, BadgeTone> = {
    active: 'success',
    temporary: 'warning',
    restricted: 'danger',
    deactivated: 'neutral',
};

export default function StatusBadge({ status, label }: { status: string; label: string }) {
    return <Badge tone={tones[status] ?? 'neutral'}>{label}</Badge>;
}
