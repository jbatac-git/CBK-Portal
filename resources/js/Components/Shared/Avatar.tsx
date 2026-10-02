interface AvatarProps {
    name: string;
    photoUrl?: string | null;
    size?: 'sm' | 'md' | 'lg';
    /** Kapag ibinigay ang dalawang ito, ginagamit sila para sa initials
     * sa halip na paghati-hatiin ang buong `name` (na posibleng may middle name). */
    firstName?: string;
    lastName?: string;
}

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-20 w-20 text-xl',
};

export default function Avatar({ name, photoUrl, size = 'md', firstName, lastName }: AvatarProps) {
    const initials =
        firstName && lastName
            ? `${firstName[0]}${lastName[0]}`.toUpperCase()
            : name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

    if (photoUrl) {
        return <img src={photoUrl} alt={name} className={`${sizeClasses[size]} rounded-full object-cover`} />;
    }

    return (
        <div className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-maroon font-medium text-white`}>
            {initials}
        </div>
    );
}