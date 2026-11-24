// /pocoapoke/src/components/FilterSheet.tsx
import type { MasterItem } from "../types";
import { BottomSheet } from "./BottomSheet";
import { Chip } from "./Chip";

type Props = {
  open: boolean;
  title: string;
  items: MasterItem[];
  selected: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
};

export function FilterSheet({ open, title, items, selected, onSelect, onClose }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title={`${title}で絞り込み`}>
      <div className="flex flex-wrap gap-1.5">
        {items.map((m) => (
          <Chip key={m.id} selected={selected === m.id} onClick={() => onSelect(m.id)}>{m.label}</Chip>
        ))}
      </div>
    </BottomSheet>
  );
}
