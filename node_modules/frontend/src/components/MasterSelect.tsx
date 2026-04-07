// src/components/MasterSelect.tsx
// import { MASTER_CLASS } from "../constants";

type Props = {
  className: string; // "specialty" など
  label: string;
  masterCodes: Record<string, { id: number; code: number; label: string }[]>;
  value: number | null;
  onChange: (value: number | null) => void;
};

export function MasterSelect({
  className,
  label,
  masterCodes,
  value,
  onChange,
}: Props) {
  const items = masterCodes[className] ?? [];

  return (
    <div>
      <label>{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">選択してください</option>
        {items.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
