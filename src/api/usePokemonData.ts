// /pocoapoke/src/api/usePokemonData.ts
import { useQuery } from "@tanstack/react-query";
import type { PokemonData } from "../types";

export const POKEMON_DATA_KEY = ["pokemonData"];

export function usePokemonData() {
  return useQuery<PokemonData>({
    queryKey: POKEMON_DATA_KEY,
    queryFn: async () => {
      const res = await fetch("/api/getPokemonData");
      if (!res.ok) throw new Error(`getPokemonData: ${res.status}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}
