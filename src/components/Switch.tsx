// /pocoapoke/src/components/Switch.tsx
type Props = { checked: boolean; onChange: (checked: boolean) => void; label?: string };

export function Switch({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[26px] w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-green-500" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left] ${checked ? "left-[21px]" : "left-[3px]"}`}
      />
    </button>
  );
}
