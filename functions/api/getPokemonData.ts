// functions/api/getPokemonData.ts
export async function onRequestGet({ env }) {
  const db = env.DB;

  // ① ポケモン本体だけ取得
  const { results: pokemon } = await db
    .prepare(`
      SELECT
        id,
        category,
        number,
        local_number,
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

  // ② pokemon_status を取得（1対1）
  const { results: status } = await db
    .prepare(`
      SELECT
        poke_id,
        status_code,
        place_code,
        today_wish
      FROM pokemon_status
    `)
    .all();

  // ③ master_code を一括取得
  const { results: master } = await db
    .prepare(`
      SELECT id, code, label, class
      FROM master_code
    `)
    .all();

  // master_code を class ごとにまとめる
  const masterByClass = master.reduce((acc, m) => {
    if (!acc[m.class]) acc[m.class] = [];
    acc[m.class].push(m);
    return acc;
  }, {});

  // Map 化（高速参照）
  const masterMap = new Map(master.map((m) => [m.id, m]));
  const statusMap = new Map(status.map((s) => [s.poke_id, s]));

  // JS 側で整形
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

    const st = statusMap.get(p.id);

    return {
      id: p.id,
      category: p.category,
      number: p.number,
      local_number: p.local_number,
      name: p.name,
      specialty1: masterMap.get(p.specialty1) || null,
      specialty2: masterMap.get(p.specialty2) || null,
      environment: masterMap.get(p.environment) || null,
      favorites,
      status: st
        ? {
            status_code: masterMap.get(st.status_code) || null,
            place_code: masterMap.get(st.place_code) || null,
            today_wish: masterMap.get(st.today_wish) || null,
          }
        : null,
    };
  });

  return new Response(JSON.stringify({
    pokemon: mapped,
    master: masterByClass,
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
