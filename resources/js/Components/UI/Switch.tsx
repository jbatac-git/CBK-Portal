interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** Accessible name; also shown as visible text when `showLabel` is true. */
    label: string;
    showLabel?: boolean;
    disabled?: boolean;
    id?: string;
}

export default function Switch({ checked, onChange, label, showLabel = false, disabled = false, id }: SwitchProps) {
    return (
        <label className={`inline-flex items-center gap-2.5 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={showLabel ? undefined : label}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
                    checked ? 'bg-maroon-700' : 'bg-stone-300'
                }`}
            >
                <span
                    aria-hidden="true"
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ${
                        checked ? 'translate-x-[18px]' : 'translate-x-0.5'
                    }`}
                />
            </button>
            {showLabel && <span className="text-sm text-stone-700">{label}</span>}
        </label>
    );
}
