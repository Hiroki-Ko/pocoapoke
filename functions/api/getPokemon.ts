// /pocoapoke/functions/api/getPokemon.ts
// 編集画面用: 指定IDのポケモンを master_code の ID のまま取得する
export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ success: false, error: "idが不正です" }, { status: 400 });
  }

  const pokemon = await env.DB
    .prepare(`
      SELECT
        id, category, number, local_number, name,
        specialty1, specialty2, environment,
        favorite1, favorite2, favorite3, favorite4, favorite5, favorite6,
        show_in_progress,
        (SELECT place_code FROM pokemon_status WHERE poke_id = pokemon_ms.id) AS place_code
      FROM pokemon_ms
      WHERE id = ?
    `)
    .bind(id)
    .first();

  if (!pokemon) {
    return Response.json({ success: false, error: "ポケモンが見つかりません" }, { status: 404 });
  }

  return Response.json({ success: true, pokemon });
}
