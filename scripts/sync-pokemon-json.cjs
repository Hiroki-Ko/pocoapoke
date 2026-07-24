/**
 * 本番DBからポケモンデータを取得し、seeds/pokemon_ms.json を更新するスクリプト
 *
 * 使い方（手動実行）:
 *   node scripts/sync-pokemon-json.cjs https://your-site.pages.dev
 *
 * npm script 経由:
 *   npm run sync-pokemon
 */

const fs = require("fs");
const path = require("path");

const apiBase = process.argv[2] || process.env.SYNC_API_BASE;
if (!apiBase) {
  console.error("エラー: APIのURLが指定されていません");
  console.error("使い方: node scripts/sync-pokemon-json.cjs <URL>");
  process.exit(1);
}

const url = `${apiBase.replace(/\/$/, "")}/api/getPokemonData`;
const outputPath = path.resolve(__dirname, "../seeds/pokemon_ms.json");

async function main() {
  console.log(`取得中: ${url}`);

  let data;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    data = await res.json();
  } catch (err) {
    console.error("APIの取得に失敗しました:", err.message);
    process.exit(1);
  }

  const { pokemon } = data;
  if (!Array.isArray(pokemon)) {
    console.error("レスポンス形式が不正です（pokemon 配列が見つかりません）");
    process.exit(1);
  }

  // APIレスポンスを pokemon_ms.json の形式に変換
  const records = pokemon.map((p) => ({
    category: p.category ?? "main",
    number: p.number ?? null,
    local_number: p.local_number ?? null,
    name: p.name,
    specialty: [p.specialty1?.label, p.specialty2?.label].filter(Boolean),
    environment: p.environment?.label ?? null,
    favorites: (p.favorites ?? []).map((f) => f.label).filter(Boolean),
  }));

  // 番号順にソート（nullは末尾）
  records.sort((a, b) => {
    const na = a.number ?? a.local_number ?? Infinity;
    const nb = b.number ?? b.local_number ?? Infinity;
    return na - nb;
  });

  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2), "utf8");
  console.log(`完了: ${records.length} 件を ${outputPath} に書き出しました`);
}

main();
