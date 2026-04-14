import { BrowserRouter, Routes, Route } from "react-router-dom";
import PokemonList from "./pages/PokemonList";
import PokemonRegister from "./pages/PokemonRegister";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PokemonList />} />
        <Route path="/register" element={<PokemonRegister />} />
      </Routes>
    </BrowserRouter>
  );
}
