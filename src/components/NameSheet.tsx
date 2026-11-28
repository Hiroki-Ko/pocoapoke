// /pocoapoke/src/components/NameSheet.tsx
// 日本語名がない家具の名前を入力するパネル（かな・カナのみ。ブラウザに一時保存）
import { useState } from "react";
import type { FurnitureItem } from "../types";
import { BottomSheet } from "./BottomSheet";
import { FurnitureIcon } from "./FurnitureIcon";
import { hasKanji } from "../lib/furniture";

type Props = { item: FurnitureItem | null; current: string; onSave: (name: string) => void; onClose: () => void };

export function NameSheet({ item, current, onSave, onClose }: Props) {
  return (
    <BottomSheet open={!!item} onClose={onClose} title={item && (<><FurnitureIcon item={item} size={40} /><span>日本語名を入力</span></>)}>
      {item && <Body key={item.slug} item={item} current={current} onSave={onSave} />}
    </BottomSheet>
  );
}

function Body({ item, current, onSave }: { item: FurnitureItem; current: string; onSave: (name: string) => void }) {
  const [name, setName] = useState(current);
  const kanji = hasKanji(name);
  return (
    <>
      <div className="mb-1 text-xs text-sub">英語名: {item.en}</div>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ゲームでの名前（かな・カナ）"
        className="w-full rounded-xl border border-line px-3 py-2.5 text-[15px] outline-none focus:border-brand"
      />
      {kanji && <p className="mt-1 text-xs font-bold text-red-600">かな・カナで入力してください</p>}
      <button
        type="button"
        disabled={kanji || name.trim() === ""}
        onClick={() => onSave(name)}
        className="mt-3 w-full rounded-xl bg-brand py-3 text-[15px] font-extrabold text-white disabled:opacity-40"
      >
        保存
      </button>
      {current && (
        <button type="button" onClick={() => onSave("")} className="mt-2 w-full rounded-xl border border-line py-2.5 text-sm font-bold text-sub">
          入力した名前を消す
        </button>
      )}
    </>
  );
}
