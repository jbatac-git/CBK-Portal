import { Paginated } from '@/types/pagination';
import { Link } from '@inertiajs/react';

export default function Pagination({ paginator }: { paginator: Paginated<unknown> }) {
    if (paginator.last_page <= 1) {
        return null;
    }

    return (
        <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-600">
                Showing {paginator.from}–{paginator.to} of {paginator.total}
            </p>

            <div className="flex flex-wrap gap-1">
                {paginator.links.map((link, index) => {
                    // Laravel sends labels such as "&laquo; Previous"; strip the HTML entity.
                    const text = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                    const base = 'rounded-md border px-3 py-1.5 text-sm';

                    if (!link.url) {
                        return (
                            <span key={index} className={`${base} border-stone-200 text-stone-300`}>
                                {text}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            className={`${base} ${
                                link.active
                                    ? 'border-maroon bg-maroon text-white'
                                    : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                            }`}
                        >
                            {text}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}