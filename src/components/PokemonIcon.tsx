// /pocoapoke/src/components/PokemonIcon.tsx
// ポケモンのアイコン。画像が無い・読み込めない場合は「?」のプレースホルダを出す。
// ドット絵（PokeAPI）はくっきり拡大、ゲーム内アイコン（custom）はなめらかに表示する。
import { useState } from "react";
import { iconSrc } from "../lib/icons";

type Props = { id: number; name: string; size?: number; className?: string };

export function PokemonIcon({ id, name, size = 48, className = "" }: Props) {
  const src = iconSrc({ id, name });
  const [failed, setFailed] = useState(false);
  const box = `shrink-0 rounded-xl bg-slate-100 flex items-center justify-center ${className}`;

  if (!src || failed) {
    return (
      <div className={`${box} text-slate-400 font-black`} style={{ width: size, height: size, fontSize: size * 0.4 }} aria-label={name}>
        ?
      </div>
    );
  }
  return (
    <div className={box} style={{ width: size, height: size }}>
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`max-w-[82%] max-h-[82%] object-contain ${src.includes("/custom/") ? "" : "[image-rendering:pixelated]"}`}
      />
    </div>
  );
}
