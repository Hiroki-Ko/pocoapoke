// /pocoapoke/src/components/EvalBadge.tsx
import { evalStyle } from "../lib/evaluation";

export function EvalBadge({ code, label }: { code: number; label: string }) {
  const s = evalStyle(code);
  return (
    <span className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold" style={{ background: s.bg, color: s.fg }}>
      {label}
    </span>
  );
}
