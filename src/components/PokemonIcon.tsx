// /pocoapoke/src/components/PokemonIcon.tsx
// ポケモンのアイコン。画像が無い・読み込めない場合は「?」のプレースホルダを出す。
// ドット絵（PokeAPI）は枠いっぱいにくっきり拡大。
// ゲーム内アイコン（custom）は図鑑と同じく大きさの差を残して縮小する（小さい子を無理に拡大して粗くしない）。
import { useState } from "react";
import { iconSrc } from "../lib/icons";

type Props = { id: number; name: string; size?: number; className?: string };

// 図鑑のマスで一番大きいポケモン（約150px）を枠の90%に合わせ、小さい子ほど少し小さく表示する。
// 大小の差は図鑑より控えめにして（枠の60〜100%）、小さい子が豆粒にならないようにする
const REF = 150;
const FILL = 0.9;

export function PokemonIcon({ id, name, size = 48, className = "" }: Props) {
  const src = iconSrc({ id, name });
  const [failed, setFailed] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ src: string; w: number; h: number } | null>(null);
  const box = `shrink-0 rounded-xl bg-slate-100 flex items-center justify-center ${className}`;

  if (!src || failed === src) {
    return (
      <div className={`${box} text-slate-400 font-black`} style={{ width: size, height: size, fontSize: size * 0.4 }} aria-label={name}>
        ?
      </div>
    );
  }

  const custom = src.includes("/custom/");
  let style: React.CSSProperties = { maxWidth: "82%", maxHeight: "82%" };
  if (custom && natural?.src === src) {
    const longest = Math.max(natural.w, natural.h);
    const target = size * FILL * (0.6 + 0.4 * Math.min(1, longest / REF));
    const k = target / longest;
    style = { width: natural.w * k, height: natural.h * k };
  } else if (custom) {
    style = { maxWidth: "82%", maxHeight: "82%", visibility: "hidden" }; // 大きさが分かるまで隠す
  }

  return (
    <div className={box} style={{ width: size, height: size }}>
      <img
        src={src}
        alt={name}
        loading="lazy"
        onLoad={(e) => setNatural({ src, w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        onError={() => setFailed(src)}
        style={style}
        className={`object-contain ${custom ? "" : "[image-rendering:pixelated]"}`}
      />
    </div>
  );
}
