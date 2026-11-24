// /pocoapoke/src/components/BottomSheet.tsx
import { useEffect, type ReactNode } from "react";

type Props = { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode };

// 画面下から出るパネル。暗幕タップで閉じる。sticky 見出しやタブバーより前面（z-50）
export function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        role="dialog"
        className={`absolute inset-x-0 bottom-0 mx-auto max-h-[88dvh] max-w-md overflow-y-auto rounded-t-3xl bg-white px-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,.15)] transition-transform duration-200 ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded bg-slate-300" />
        {title && <div className="mb-2 flex items-center gap-2.5 text-base font-extrabold">{title}</div>}
        {open && children}
      </div>
    </div>
  );
}
