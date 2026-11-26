import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PokemonList from "./pages/PokemonList";
import PokemonRegister from "./pages/PokemonRegister";
import PokemonProgress from "./pages/PokemonProgress";
import Layout from "./Layout";

// 家具さがしは家具データが大きいので、開いたときに読み込む
const Furniture = lazy(() => import("./pages/Furniture"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PokemonList />} />
          <Route path="register" element={<PokemonRegister />} />
          <Route path="edit/:id" element={<PokemonRegister key="edit" />} />
          <Route path="progress" element={<PokemonProgress />} />
          <Route
            path="furniture"
            element={
              <Suspense fallback={<p className="p-6 text-center text-sub">読み込み中…</p>}>
                <Furniture />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
