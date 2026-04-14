// functions/getPokemonData.ts
export async function onRequestGet({ env }) {
  const db = env.DB;

  // ① ポケモン本体だけ取得（JOIN を消して高速化）
  const { results: pokemon } = await db
    .prepare(`
      SELECT
        id,
        number,
        name,
        specialty1,
        specialty2,
        environment,
        favorite1,
        favorite2,
        favorite3,
        favorite4,
        favorite5,
        favorite6
      FROM pokemon_ms
    `)
    .all();

  // ② master_code を一括取得（JOIN より圧倒的に速い）
  const { results: master } = await db
    .prepare(`
      SELECT id, code, label
      FROM master_code
    `)
    .all();

  // ③ Map 化（高速参照）
  const masterMap = new Map(master.map((m) => [m.id, m]));

  // ④ JS 側で整形（SQLite の JSON_OBJECT より速い）
  const mapped = pokemon.map((p) => {
    const favorites = [
      p.favorite1,
      p.favorite2,
      p.favorite3,
      p.favorite4,
      p.favorite5,
      p.favorite6,
    ]
      .filter(Boolean)
      .map((id) => masterMap.get(id));

    return {
      id: p.id,
      number: p.number,
      name: p.name,
      specialty1: masterMap.get(p.specialty1) || null,
      specialty2: masterMap.get(p.specialty2) || null,
      environment: masterMap.get(p.environment) || null,
      favorites,
    };
  });

  // ⑤ CORS を必ず付ける（ローカル & 本番で必要）
  return new Response(JSON.stringify(mapped), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
