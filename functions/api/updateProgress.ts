// /pocoapoke/functions/api/updateProgress.ts
// 住みごこち画面のパネルから、住みごこち・住んでる街・今日の欲しいものをまとめて保存する。
// お世話チェック（cared_on）には触れない（チェックは手動のみ）。
import { gameDay } from "../../src/lib/gameDay";
import { ensureStatusRow, isMasterOf } from "../lib/status";

export async function onRequestPost({ env, request }) {
  const { poke_id, status_code, place_code, wish_favorite } = await request.json();
  const db = env.DB;

  if (!Number.isInteger(poke_id)) {
    return Response.json({ success: false, error: "poke_idが不正です" }, { status: 400 });
  }
  const pokemon = await db
    .prepare("SELECT favorite1, favorite2, favorite3, favorite4, favorite5 FROM pokemon_ms WHERE id = ?")
    .bind(poke_id)
    .first();
  if (!pokemon) {
    return Response.json({ success: false, error: "ポケモンが見つかりません" }, { status: 404 });
  }
  if (!(await isMasterOf(db, status_code, "evaluation"))) {
    return Response.json({ success: false, error: "住みごこちが不正です" }, { status: 400 });
  }
  if (!(await isMasterOf(db, place_code, "place"))) {
    return Response.json({ success: false, error: "住んでる街が不正です" }, { status: 400 });
  }
  // 欲しいものは、そのポケモンの好きなもの（味以外の favorite1〜5）のどれか、または null。
  // ただし今日すでに保存済みの欲しいもの（後から好きなものを編集して外れた場合）はそのまま保存できる
  const favs = [pokemon.favorite1, pokemon.favorite2, pokemon.favorite3, pokemon.favorite4, pokemon.favorite5];
  const current = await db
    .prepare("SELECT wish_favorite, wish_on FROM pokemon_status WHERE poke_id = ?")
    .bind(poke_id)
    .first();
  const unchangedToday = current && current.wish_on === gameDay() && current.wish_favorite === wish_favorite;
  if (wish_favorite !== null && wish_favorite !== undefined && !favs.includes(wish_favorite) && !unchangedToday) {
    return Response.json({ success: false, error: "欲しいものは好きなものから選んでください" }, { status: 400 });
  }
  const wish = wish_favorite ?? null;

  await ensureStatusRow(db, poke_id);
  await db
    .prepare(`
      UPDATE pokemon_status SET
        status_code   = ?,
        place_code    = ?,
        wish_favorite = ?,
        wish_on       = ?,
        updated_at    = datetime('now')
      WHERE poke_id = ?
    `)
    .bind(status_code, place_code, wish, wish === null ? null : gameDay(), poke_id)
    .run();

  return Response.json({ success: true });
}
