import { useQuery } from "@tanstack/react-query";

export const useNextNumber = () => {
  return useQuery({
    queryKey: ["nextNumber"],
    queryFn: async () => {
      const res = await fetch("/getNextNumber");
      return res.json();
    },
  });
};
