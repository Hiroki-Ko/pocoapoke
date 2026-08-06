// /pocoapoke/functions/api/registerPokemon.ts
export async function onRequestPost(context) {
  const { env, request } = context;
  const body = await request.json();

  const {
    category,
    number,
    localNumber,
    name,
    specialty1,
    specialty2,
    environment,
    favorites,
  } = body;

  // サーバーサイドバリデーション
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

  // favorites は最大6件に揃える
  const fav = Array.isArray(favorites) ? [...favorites] : [];
  while (fav.length < 6) fav.push(null);

  const result = await env.DB.prepare(
    `
      INSERT INTO pokemon_ms (
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
        favorite6,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `
  )
    .bind(
      category,
      finalNumber,
      finalLocalNumber,
      name,
      specialty1,
      specialty2 ?? null,
      environment,
      fav[0],
      fav[1],
      fav[2],
      fav[3],
      fav[4],
      fav[5]
    )
    .run();

  // 新しく作られた pokemon_ms.id を取得
  const newId = result.meta.last_row_id;

  // pokemon_status を INSERT（1対1）
  await env.DB.prepare(`
      INSERT INTO pokemon_status (
        poke_id,
        status_code,
        place_code,
        today_wish,
        created_at
      )
      VALUES (
        ?,
        (SELECT id FROM master_code WHERE class='evaluation' AND code=0),
        (SELECT id FROM master_code WHERE class='place' AND code=0),
        (SELECT id FROM master_code WHERE class='wish' AND code=0),
        datetime('now')
      )
    `)
    .bind(newId)
    .run();

  return Response.json({ success: true });
}
