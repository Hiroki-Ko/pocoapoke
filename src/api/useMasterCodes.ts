import { useQuery } from "@tanstack/react-query";

export function useMasterCodes() {
  return useQuery({
    queryKey: ["masterCodes"],
    queryFn: async () => {
      const res = await fetch("/getMasterCode");
      const data = await res.json();
      console.log("masterCodes:", data);
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1時間キャッシュ
  });
}

// export function useMasterCodes() {
//   return useQuery({
//     queryKey: ["masterCodes"],
//     queryFn: async () => {
//       const res = await fetch("/getMasterCode");
//       console.log("raw response:", res);  // ★ ここで中身を見る

//       const text = await res.text();
//       console.log("raw text:", text);     // ★ JSON でない可能性が高い

//       const data = JSON.parse(text);      // ★ ここで例外が出るか確認
//       console.log("masterCodes:", data);

//       return data;
//     },
//   });
// }
