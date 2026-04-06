// functions/index.ts
import { getPokemonData } from "./getPokemonData";
import { getMasterCode } from "./getMasterCode";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // GET /getPokemonData
    if (url.pathname === "/getPokemonData") {
      const data = await getPokemonData(env);

      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
    // GET /getMasterCode
    if (url.pathname === "/getMasterCode") {
      const data = await getMasterCode(env);

      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
