/**
 * 完全バックアップ（seeds/backup/pocoapoke-data.json）から、D1 に流し込める SQL を作る
 *
 *   node scripts/backup-to-sql.cjs > restore.sql
 *   npx wrangler d1 execute pocoapoke --remote --file=restore.sql   ← 本番に戻すとき（中身は全件入れ直し）
 *
 * テーブル定義は seeds/schema.sql で作成済みである前提。master_code の value・各テーブルの日時は復元しない。
 */
const fs = require("fs");
const path = require("path");

const file = process.argv[2] || path.resolve(__dirname, "../seeds/backup/pocoapoke-data.json");
const b = JSON.parse(fs.readFileSync(file, "utf8"));
const v = (x) => (x === null || x === undefined ? "NULL" : typeof x === "number" ? String(x) : `'${String(x).replace(/'/g, "''")}'`);

const out = ["PRAGMA defer_foreign_keys = true;", "DELETE FROM pokemon_status;", "DELETE FROM pokemon_ms;", "DELETE FROM master_code;"];
for (const m of b.master_code) {
  out.push(`INSERT INTO master_code (id, class, code, label) VALUES (${v(m.id)}, ${v(m.class)}, ${v(m.code)}, ${v(m.label)});`);
}
for (const p of b.pokemon_ms) {
  const f = [...p.favorite_ids, null, null, null, null, null, null].slice(0, 6);
  out.push(
    `INSERT INTO pokemon_ms (id, category, number, local_number, name, specialty1, specialty2, environment, favorite1, favorite2, favorite3, favorite4, favorite5, favorite6, show_in_progress) VALUES (${[
      p.id, p.category, p.number, p.local_number, p.name, p.specialty1, p.specialty2, p.environment, ...f, p.show_in_progress,
    ].map(v).join(", ")});`,
  );
}
for (const s of b.pokemon_status) {
  out.push(
    `INSERT INTO pokemon_status (poke_id, status_code, place_code, cared_on, wish_favorite, wish_on) VALUES (${[
      s.poke_id, s.status_code, s.place_code, s.cared_on, s.wish_favorite, s.wish_on,
    ].map(v).join(", ")});`,
  );
}
process.stdout.write(out.join("\n") + "\n");
