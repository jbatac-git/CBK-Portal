interface AvatarProps {
    name: string;
    photoUrl?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /** When both are given they are used for the initials instead of
     * splitting the full `name` (which may include a middle name). */
    firstName?: string;
    lastName?: string;
}

const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-20 w-20 text-2xl',
};

export default function Avatar({ name, photoUrl, size = 'md', firstName, lastName }: AvatarProps) {
    const initials =
        firstName && lastName
            ? `${firstName[0]}${lastName[0]}`.toUpperCase()
            : name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

    if (photoUrl) {
        return (
            <img
                src={photoUrl}
                alt={name}
                className={`${sizeClasses[size]} shrink-0 rounded-full object-cover ring-1 ring-black/5`}
            />
        );
    }

    return (
        <div
            aria-label={name}
            role="img"
            className={`${sizeClasses[size]} flex shrink-0 select-none items-center justify-center rounded-full bg-maroon-100 font-semibold tracking-wide text-maroon-800 ring-1 ring-maroon-200/60`}
        >
            {initials}
        </div>
    );
}
