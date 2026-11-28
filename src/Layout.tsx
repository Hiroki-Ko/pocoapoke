// /pocoapoke/src/Layout.tsx
// スマホ幅を基準に中央寄せ。ヘッダーは各ページが持ち、タブバーは下部に固定。
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TabBar } from "./components/TabBar";
import { installBackGuard } from "./lib/backGuard";

export default function Layout() {
  // スマホの戻るボタン（ジェスチャー）では画面を戻さない・アプリを閉じない
  const guard = useRef<ReturnType<typeof installBackGuard> | null>(null);
  const location = useLocation();
  useEffect(() => {
    guard.current = installBackGuard(window);
    return () => guard.current?.cleanup();
  }, []);
  useEffect(() => {
    guard.current?.onNavigate();
  }, [location.key]);

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-page pb-[calc(4rem+env(safe-area-inset-bottom))] shadow-sm">
      <Outlet />
      <TabBar />
    </div>
  );
}
