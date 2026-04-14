// src/api/usePokemonData.ts
import { useQuery } from "@tanstack/react-query";

export function usePokemonData() {
  return useQuery({
    queryKey: ["pokemonData"],
    queryFn: async () => {
      const res = await fetch("/api/getPokemonData");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
