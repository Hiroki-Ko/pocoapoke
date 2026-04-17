import { useQuery } from "@tanstack/react-query";

export const useNextNumber = () => {
  return useQuery({
    queryKey: ["nextNumber"],
    queryFn: async () => {
      const res = await fetch("/api/getNextNumber");
      return res.json();
    },
  });
};
