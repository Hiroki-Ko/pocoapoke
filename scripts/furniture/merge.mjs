// Serebii の属性データと op.gg の日本語名を合わせて、アプリ用の家具データを作る

const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * @param {{ en: string; slug: string; tag: string | null; image: string; favorites: string[] }[]} serebii
 * @param {Record<string, string>} names op.gg のスラッグ → 日本語名
 * @param {Record<string, number>} favMap 英語カテゴリ名 → master_code の code
 * @param {string[]} allowUntagged 分類なしでも家具として残す英語名
 * @param {(slug: string) => boolean} hasImage 画像ファイルがあるか（無ければ image は null）
 */
export function mergeFurniture(serebii, names, favMap, allowUntagged = [], hasImage = () => true) {
  const nameByKey = new Map(Object.entries(names).map(([slug, name]) => [key(slug), name]));
  const allow = new Set(allowUntagged);
  const items = [];
  const missing = [];
  const kanji = [];
  for (const s of serebii) {
    if (!s.tag && !allow.has(s.en)) continue;
    const name = nameByKey.get(key(s.slug));
    // 日本語名が見つからないものは英語名で入れ、画面では別枠に出す
    if (!name) missing.push({ slug: s.slug, reason: "no-name" });
    else if (/[\u4e00-\u9fff々]/.test(name)) kanji.push({ slug: s.slug, name });
    const favorites = [...new Set(s.favorites.map((f) => favMap[f]).filter((c) => c != null))].sort((a, b) => a - b);
    if (favorites.length === 0) {
      missing.push({ slug: s.slug, reason: "no-favorite" });
      continue;
    }
    const it = { slug: s.slug, name: name ?? s.en, en: s.en, tag: s.tag ?? "", favorites, image: hasImage(s.slug) ? `${s.slug}.png` : null };
    items.push(name ? it : { ...it, noJa: true });
  }
  items.sort((a, b) => a.name.localeCompare(b.name, "ja"));
  return { items, missing, kanji };
}
