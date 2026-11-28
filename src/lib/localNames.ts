// 日本語名がない家具に、ブラウザで入力した名前（{ slug: 名前 }）。Claude に送って overrides.json で正式に反映する
const KEY = "pocoapoke.furniture.names";

export function loadNames(): Record<string, string> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    // 文字列でない・空の値は捨てる（壊れたデータで画面が落ちないように）
    return Object.fromEntries(
      Object.entries(v)
        .filter((e): e is [string, string] => typeof e[1] === "string" && e[1].trim() !== "")
        .map(([k, s]) => [k, s.trim()]),
    );
  } catch {
    return {};
  }
}

// 前後の空白を削って保存。空なら削除。保存できなくても、入れ替えた後の内容を返す
export function saveName(slug: string, name: string): Record<string, string> {
  const names = { ...loadNames() };
  const v = name.trim();
  if (v) names[slug] = v;
  else delete names[slug];
  try {
    localStorage.setItem(KEY, JSON.stringify(names));
  } catch {
    /* 保存できなくても画面は動かす */
  }
  return names;
}

export function exportNames(names: Record<string, string>): string {
  return Object.keys(names)
    .sort()
    .map((slug) => `${slug}=${names[slug]}`)
    .join("\n");
}
