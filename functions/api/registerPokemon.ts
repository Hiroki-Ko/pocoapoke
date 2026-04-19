// /pocoapoke/functions/registerPokemon.ts
export async function onRequestPost(context) {
  const { env, request } = context;
  const body = await request.json();

  const {
    number,
    name,
    specialty1,
    specialty2,
    environment,
    favorites,
  } = body;

  // favorites は最大6件に揃える
  const fav = [...favorites];
  while (fav.length < 6) fav.push(null);

  const result = await env.DB.prepare(
    `
      INSERT INTO pokemon_ms (
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
        favorite6,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `
  )
    .bind(
      number,
      name,
      specialty1,
      specialty2,
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
  const newId = result.lastInsertRowId;

  // 2. pokemon_status を INSERT（1対1）
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
        (SELECT id FROM master_code WHERE class='evaluation' AND code=1),
        (SELECT id FROM master_code WHERE class='place' AND code=1),
        (SELECT id FROM master_code WHERE class='wish' AND code=0),
        datetime('now')
      )
    `)
    .bind(newId)
    .run();


  return Response.json({ success: true });
}
