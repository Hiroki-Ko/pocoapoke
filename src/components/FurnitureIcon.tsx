// /pocoapoke/src/components/FurnitureIcon.tsx
// 家具の画像。画像が無い・読み込めない場合は灰色の枠に🪑を出す
import { useState } from "react";
import type { FurnitureItem } from "../types";

export function FurnitureIcon({ item, size = 48 }: { item: FurnitureItem; size?: number }) {
  const [failed, setFailed] = useState(false);
  const box = "shrink-0 rounded-xl bg-slate-100 flex items-center justify-center";
  if (!item.image || failed) {
    return (
      <div className={`${box} text-slate-400`} style={{ width: size, height: size, fontSize: size * 0.45 }} aria-label={item.name}>
        🪑
      </div>
    );
  }
  return (
    <div className={box} style={{ width: size, height: size }}>
      <img src={`/items/${item.image}`} alt={item.name} loading="lazy" onError={() => setFailed(true)} className="max-h-[86%] max-w-[86%] object-contain" />
    </div>
  );
}
