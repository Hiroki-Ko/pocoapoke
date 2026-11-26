// /pocoapoke/src/components/TabBar.tsx
import { NavLink, useLocation } from "react-router-dom";

const TABS = [
  { to: "/", label: "一覧", icon: "☰", end: true },
  { to: "/progress", label: "住みごこち", icon: "🏠", end: false },
  { to: "/furniture", label: "家具", icon: "🪑", end: false },
  { to: "/register", label: "登録", icon: "＋", end: false },
];

export function TabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          // 今いる画面のタブをもう一度押したら一番上へ戻る
          onClick={() => {
            if (pathname === t.to) window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={({ isActive }) =>
            `flex-1 py-2 text-center text-[11px] ${isActive ? "font-extrabold text-brand" : "text-sub"}`
          }
        >
          <span className="block text-lg leading-tight">{t.icon}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
