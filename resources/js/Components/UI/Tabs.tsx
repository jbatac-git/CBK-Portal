export interface TabItem {
    value: string;
    label: string;
    count?: number;
}

interface TabsProps {
    tabs: TabItem[];
    value: string;
    onChange: (value: string) => void;
    label: string;
}

/** Underlined tab strip; selection is controlled by the caller (often a query param). */
export default function Tabs({ tabs, value, onChange, label }: TabsProps) {
    return (
        <div role="tablist" aria-label={label} className="mb-5 flex gap-6 overflow-x-auto border-b border-line">
            {tabs.map((tab) => {
                const selected = tab.value === value;

                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(tab.value)}
                        className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 pb-2.5 pt-1 text-sm font-medium transition-colors ${
                            selected ? 'border-maroon-700 text-ink' : 'border-transparent text-stone-500 hover:text-ink'
                        }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className="tabular rounded bg-stone-100 px-1.5 text-2xs font-semibold text-stone-600">{tab.count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
