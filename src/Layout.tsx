// /pocoapoke/src/Layout.tsx
import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Layout.css";

export default function Layout() {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setFade(window.scrollY > 50); // 50px以上スクロールしたら薄くする
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      <nav className={`tabs ${fade ? "fade" : ""}`}>
        <NavLink to="/" end className="tab">List</NavLink>
        <NavLink to="/register" className="tab">Register</NavLink>
        <NavLink to="/progress" className="tab">Progress</NavLink>
      </nav>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
