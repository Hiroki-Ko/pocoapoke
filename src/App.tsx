import { BrowserRouter, Routes, Route } from "react-router-dom";
import PokemonList from "./pages/PokemonList";
import PokemonRegister from "./pages/PokemonRegister";
import PokemonProgress from "./pages/PokemonProgress";
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PokemonList />} />
        <Route path="/register" element={<PokemonRegister />} />
        <Route path="/progress" element={<PokemonProgress />} />
      </Routes>
    </BrowserRouter>
  );
}
