// /pocoapoke/functions/api/updateStatus.ts
export async function onRequestPatch({ request, env }) {
  const db = env.DB;

  // ① リクエスト内容を取得
  const { poke_id, field, master_id } = await request.json();

  // ② field の安全チェック（SQLインジェクション防止）
  const allowedFields = ["status_code", "place_code", "today_wish"];
  if (!allowedFields.includes(field)) {
    return new Response(JSON.stringify({ error: "Invalid field" }), { status: 400 });
  }

  // ③ DB 更新
  await db.prepare(
    `UPDATE pokemon_status SET ${field} = ?, updated_at = datetime('now') WHERE poke_id = ?`
  )
  .bind(master_id, poke_id)
  .run();

  // ④ レスポンス
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
