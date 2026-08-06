import { useQuery } from "@tanstack/react-query";
import type { PokemonCategory } from "../constants";

export const useNextLocalNumber = (category: PokemonCategory) => {
  return useQuery({
    queryKey: ["nextLocalNumber", category],
    queryFn: async () => {
      const res = await fetch(`/api/getNextLocalNumber?category=${category}`);
      return res.json();
    },
    enabled: category === "ex" || category === "dlc",
  });
};
