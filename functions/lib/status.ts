// pokemon_status の行が無い場合は初期値で作成してから更新するためのヘルパー。
// 本番DBに poke_id の UNIQUE 制約が無い場合でも動くよう、ON CONFLICT ではなく NOT EXISTS で判定する
export async function ensureStatusRow(db, pokeId: number) {
  await db
    .prepare(`
      INSERT INTO pokemon_status (poke_id, status_code, place_code, today_wish, created_at)
      SELECT
        ?,
        (SELECT id FROM master_code WHERE class='evaluation' AND code=0),
        (SELECT id FROM master_code WHERE class='place' AND code=0),
        (SELECT id FROM master_code WHERE class='wish' AND code=0),
        datetime('now')
      WHERE NOT EXISTS (SELECT 1 FROM pokemon_status WHERE poke_id = ?)
    `)
    .bind(pokeId, pokeId)
    .run();
}

// 指定 master_code.id が指定 class に属するか
export async function isMasterOf(db, id: unknown, cls: string): Promise<boolean> {
  if (!Number.isInteger(id)) return false;
  const row = await db.prepare("SELECT 1 AS ok FROM master_code WHERE id = ? AND class = ?").bind(id, cls).first();
  return !!row;
}
