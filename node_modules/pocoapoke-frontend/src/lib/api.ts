// frontend/src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_BASE;
console.log(API_BASE);

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_BASE}${path}`);
    console.log(res);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }
};
