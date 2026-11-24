// /pocoapoke/src/components/Chip.tsx
import type { ReactNode } from "react";

type Props = {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  tone?: "brand" | "indigo";
};

// 親指で押しやすい選択チップ
export function Chip({ selected = false, disabled = false, onClick, children, tone = "brand" }: Props) {
  const on = tone === "indigo" ? "border-indigo-800 bg-indigo-800 text-white" : "border-brand bg-brand text-white";
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] transition-colors disabled:opacity-35 ${selected ? `${on} font-bold` : "border-slate-300 bg-white text-ink"}`}
    >
      {children}
    </button>
  );
}
