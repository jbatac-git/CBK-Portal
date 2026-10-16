import { Paginated } from '@/types/pagination';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Result count plus page links; renders the count even when there is only one page. */
export default function Pagination({ paginator }: { paginator: Paginated<unknown> }) {
    if (paginator.total === 0) {
        return null;
    }

    const [prev, ...rest] = paginator.links;
    const next = rest.pop();
    const pages = rest;

    const base = 'tabular inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[13px] font-medium transition-colors';

    return (
        <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
            <p className="tabular text-[13px] text-stone-500">
                <span className="font-medium text-ink">{paginator.from}–{paginator.to}</span> of {paginator.total}
            </p>

            {paginator.last_page > 1 && (
                <div className="flex items-center gap-1">
                    {[prev, ...pages, next].map((link, index) => {
                        if (!link) return null;

                        const isPrev = index === 0;
                        const isNext = link === next;
                        const content = isPrev ? (
                            <ChevronLeft className="h-4 w-4" aria-label="Previous page" />
                        ) : isNext ? (
                            <ChevronRight className="h-4 w-4" aria-label="Next page" />
                        ) : (
                            link.label
                        );

                        if (!link.url) {
                            return (
                                <span key={index} className={`${base} text-stone-300`} aria-disabled="true">
                                    {content}
                                </span>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                aria-current={link.active ? 'page' : undefined}
                                className={`${base} ${
                                    link.active ? 'bg-ink text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-ink'
                                }`}
                            >
                                {content}
                            </Link>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}
