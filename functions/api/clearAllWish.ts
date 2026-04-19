// /pocoapoke/functions/api/clearAllWish.ts
export async function onRequestPost({ env }) {
  const db = env.DB;

  await db.prepare(`
    UPDATE pokemon_status
    SET today_wish = (SELECT id FROM master_code WHERE class='wish' AND code=0),
        updated_at = datetime('now')
  `).run();

  return Response.json({ success: true });
}
