// /pocoapoke/src/components/AppHeader.tsx
import type { ReactNode } from "react";
import { PokemonIcon } from "./PokemonIcon";

type Props = { title: string; subtitle: string; count?: number; unit?: string; children?: ReactNode };

// 各ページ上部の黄色いヘッダー。children（街チップなど）はヘッダー内に置く
export function AppHeader({ title, subtitle, count, unit = "匹", children }: Props) {
  return (
    <header className="bg-gradient-to-br from-[#ffd84d] via-sun to-[#ffb800] px-3 pt-2.5 pb-2">
      {/* 左: 見出しと説明 / 右: メタモン＋pocoapoke（見出しと同じ高さ）、その下に匹数 */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-[19px] font-black tracking-wide">{title}</h1>
          <p className="text-[11px] font-semibold text-[#6b5200]">{subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-[11px] font-extrabold tracking-wide text-[#7a5b00]">
            <PokemonIcon id={48} name="メタモン" size={22} className="!rounded-full !bg-white/70" />
            <span>pocoapoke</span>
          </div>
          {count !== undefined && (
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold">{count}{unit}</span>
          )}
        </div>
      </div>
      {children}
    </header>
  );
}
