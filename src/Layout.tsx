// /pocoapoke/src/Layout.tsx
// スマホ幅を基準に中央寄せ。ヘッダーは各ページが持ち、タブバーは下部に固定。
import { Outlet } from "react-router-dom";
import { TabBar } from "./components/TabBar";

export default function Layout() {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-page pb-[calc(4rem+env(safe-area-inset-bottom))] shadow-sm">
      <Outlet />
      <TabBar />
    </div>
  );
}
