// /pocoapoke/src/api/useMasterCodes.ts
import { useQuery } from "@tanstack/react-query";

export type MasterItem = {
  id: number;
  code: number;
  label: string;
  class: string;
};

export type Master = Record<string, MasterItem[]>;

export const useMasterCodes = () => {
  return useQuery<Master>({
    queryKey: ["masterCodes"],
    queryFn: async () => {
      // const res = await fetch("/masterCodes.json");
      const res = await fetch("/getMasterCode");
      if (!res.ok) throw new Error("failed to fetch masterCodes");
      console.log(res)
      return res.json();
    },
  });
};
