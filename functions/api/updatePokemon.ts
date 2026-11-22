// /pocoapoke/functions/api/updatePokemon.ts
// 登録済みポケモン(pokemon_ms)の情報を更新する。pokemon_status は変更しない。
export async function onRequestPost(context) {
  const { env, request } = context;
  const body = await request.json();

  const {
    id,
    category,
    number,
    localNumber,
    name,
    specialty1,
    specialty2,
    environment,
    favorites,
  } = body;

  // サーバーサイドバリデーション（registerPokemon と同じルール）
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ success: false, error: "idが不正です" }, { status: 400 });
  }
  if (!["main", "ex", "dlc"].includes(category)) {
    return Response.json({ success: false, error: "categoryが不正です" }, { status: 400 });
  }
  if (!name || String(name).trim() === "") {
    return Response.json({ success: false, error: "名前は必須です" }, { status: 400 });
  }
  if (!specialty1) {
    return Response.json({ success: false, error: "得意なこと1は必須です" }, { status: 400 });
  }
  if (!environment) {
    return Response.json({ success: false, error: "好きな環境は必須です" }, { status: 400 });
  }
  if (category === "main") {
    if (typeof number !== "number" || Number.isNaN(number)) {
      return Response.json({ success: false, error: "番号は必須です" }, { status: 400 });
    }
  } else {
    if (typeof localNumber !== "number" || Number.isNaN(localNumber)) {
      return Response.json({ success: false, error: "番号(ローカル)は必須です" }, { status: 400 });
    }
  }

  // category に応じて number / local_number の片方は必ず null にする
  const finalNumber = category === "main" ? number : null;
  const finalLocalNumber = category === "main" ? null : localNumber;

  // favorites は6件に揃える
  const fav = Array.isArray(favorites) ? favorites.slice(0, 6) : [];
  while (fav.length < 6) fav.push(null);

  const result = await env.DB.prepare(
    `
      UPDATE pokemon_ms SET
        category     = ?,
        number       = ?,
        local_number = ?,
        name         = ?,
        specialty1   = ?,
        specialty2   = ?,
        environment  = ?,
        favorite1    = ?,
        favorite2    = ?,
        favorite3    = ?,
        favorite4    = ?,
        favorite5    = ?,
        favorite6    = ?,
        updated_at   = datetime('now')
      WHERE id = ?
    `
  )
    .bind(
      category,
      finalNumber,
      finalLocalNumber,
      String(name).trim(),
      specialty1,
      specialty2 ?? null,
      environment,
      fav[0] ?? null,
      fav[1] ?? null,
      fav[2] ?? null,
      fav[3] ?? null,
      fav[4] ?? null,
      fav[5] ?? null,
      id
    )
    .run();

  if (!result.meta.changes) {
    return Response.json({ success: false, error: "ポケモンが見つかりません" }, { status: 404 });
  }

  return Response.json({ success: true });
}
