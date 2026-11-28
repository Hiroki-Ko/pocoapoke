// /pocoapoke/src/components/NameSheet.tsx
// 家具の名前を入力・修正するパネル（かな・カナのみ、「うえ木」は可。ブラウザに一時保存）
import { useState } from "react";
import type { FurnitureItem } from "../types";
import { BottomSheet } from "./BottomSheet";
import { FurnitureIcon } from "./FurnitureIcon";
import { hasKanji } from "../lib/furniture";

type Props = { item: FurnitureItem | null; current: string; official: FurnitureItem | null; onSave: (name: string) => void; onClose: () => void };

export function NameSheet({ item, current, official, onSave, onClose }: Props) {
  return (
    <BottomSheet open={!!item} onClose={onClose} title={item && (<><FurnitureIcon item={item} size={40} /><span>{official?.noJa ? "日本語名を入力" : "名前を直す"}</span></>)}>
      {item && <Body key={item.slug} item={item} current={current} official={official} onSave={onSave} />}
    </BottomSheet>
  );
}

function Body({ item, current, official, onSave }: { item: FurnitureItem; current: string; official: FurnitureItem | null; onSave: (name: string) => void }) {
  // 修正のときは今の名前から書きかえられるようにする
  const [name, setName] = useState(current || (official && !official.noJa ? official.name : ""));
  const kanji = hasKanji(name);
  return (
    <>
      <div className="mb-1 text-xs text-sub">
        英語名: {item.en}
        {official && !official.noJa && <> ／ データの名前: {official.name}</>}
      </div>
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
          入力した名前を消す（データの名前にもどす）
        </button>
      )}
    </>
  );
}
