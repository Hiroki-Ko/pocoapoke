// /pocoapoke/functions/api/updateCare.ts
// 今日のお世話チェックの付け外し。cared_on 以外は変更しない。
import { gameDay } from "../../src/lib/gameDay";
import { ensureStatusRow } from "../lib/status";

export async function onRequestPost({ env, request }) {
  const { poke_id, cared } = await request.json();
  if (!Number.isInteger(poke_id) || typeof cared !== "boolean") {
    return Response.json({ success: false, error: "パラメータが不正です" }, { status: 400 });
  }
  const exists = await env.DB.prepare("SELECT 1 AS ok FROM pokemon_ms WHERE id = ?").bind(poke_id).first();
  if (!exists) {
    return Response.json({ success: false, error: "ポケモンが見つかりません" }, { status: 404 });
  }

  const caredOn = cared ? gameDay() : null;
  await ensureStatusRow(env.DB, poke_id);
  await env.DB
    .prepare("UPDATE pokemon_status SET cared_on = ?, updated_at = datetime('now') WHERE poke_id = ?")
    .bind(caredOn, poke_id)
    .run();

  return Response.json({ success: true, cared_on: caredOn });
}
