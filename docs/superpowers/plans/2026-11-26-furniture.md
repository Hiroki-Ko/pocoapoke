# 家具さがし Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** すみかに置ける家具の一覧（画像・属性つき）と、属性→ポケモン、ポケモン（複数可）→家具の検索画面を追加する。

**Architecture:** 家具データは読み取り専用の `src/data/furniture.json`（属性は `master_code` favorite の code）としてアプリに同梱し、家具ページは `React.lazy` で遅れて読み込む。順位づけ・絞り込みは `src/lib/furniture.ts` の純粋関数にまとめて vitest でテストする。データは Claude が Web から集め、中間データを `scripts/furniture/` に残してスクリプトで JSON を組み立てる。

**Tech Stack:** React 19, react-router-dom 7, TanStack Query 5, Tailwind CSS v4, vitest 3, Node（スクリプト）, sharp（画像）

**Spec:** `docs/superpowers/specs/2026-11-26-furniture-design.md`

## Global Constraints
- D1・API（`functions/`）は変えない
- `git push` と本番への反映はユーザーが行う。Claude はファイル変更と、タスクごとのコミットコマンドの用意まで（ユーザーの PC の `C:\Users\User\my_apps\pocoapoke`）
- 作業場所: クラウドに `git clone https://github.com/Hiroki-Ko/pocoapoke` して `npm install`・テスト・ビルドを行い、変わったファイルをユーザーの PC のリポジトリへ書き戻す（PC の Linux 環境では Windows 用 node_modules のため vitest/vite が動かない）
- 好きなもの: `master_code` class=favorite の code 6〜48（43 種類）。味 code 1〜5 は家具に使わない
- 家具データの出所: Serebii（属性）、op.gg 日本語ページ（日本語名）、Bulbapedia（照合）。Game8 からは取り込まない
- 画面の文言は日本語。見た目は今の ListCard / SimilarSheet / 黄色ヘッダーにそろえる
- 出典表示の文言（家具ページ最下部）: 「家具データ: Serebii.net、op.gg、Bulbapedia（CC BY-NC-SA）を参考に作成。画像 ©Pokémon / Nintendo / Creatures / GAME FREAK / KOEI TECMO GAMES」

## Review Focus
1. 名前検索をひらがなで入れても、カタカナの家具名に当たる（「いす」で「…イス」が出る）。全角/半角・大文字小文字も区別しない
2. 好きなものが 5 つそろっていない・null を含むポケモンを選んでも落ちず、そのポケモンは当てはまり 0 として扱う
3. 同じ属性を複数のポケモンが好きなとき、合計（total）はポケモンごとに数え、種類（kinds）は 1 と数える
4. `/furniture?poke=` に存在しない id・数字でない値が来ても落ちず、選択なしで開く
5. 画像が `null`、または読み込みに失敗した家具は、灰色の枠＋家具アイコンで表示される

---

### Task 1: 属性データの収集（Serebii）

**Files:**
- Create: `scripts/furniture/favorite-map.json`
- Create: `scripts/furniture/raw/serebii-favorites.json`

**Interfaces:**
- Produces: `favorite-map.json` = `{ [英語カテゴリ名: string]: number }`（code）。43 件ちょうど
- Produces: `serebii-favorites.json` = `{ en: string; slug: string; tag: string | null; image: string; favorites: string[] }[]`（`favorites` は英語カテゴリ名、`tag` は Serebii の分類を小文字化、分類なしは null、`image` は Serebii の画像 URL、`slug` は英語名を小文字・ハイフンつなぎ）

- [ ] **Step 1:** https://www.serebii.net/pokemonpokopia/favorites.shtml から 43 カテゴリの英語名と各ページ URL を集め、`master_code`（`seeds/master_code.sql` の favorite 6〜48）と対応づけて `favorite-map.json` を作る。意味で迷うもの（例: "Wobbly stuff"=ゆれる）は Bulbapedia/各ページの説明で確認
- [ ] **Step 2:** 43 ページを WebFetch し、各アイテムの英語名・分類・画像 URL を集めて `serebii-favorites.json` にアイテム単位でまとめる（同じアイテムの favorites を合わせる）。1 ページごとに件数をメモしておく
- [ ] **Step 3:** 確認: `node -e` で、全アイテムの favorites が `favorite-map.json` のキーにすべて含まれること、各カテゴリの件数が Step 2 のメモと一致することを出力して確かめる

### Task 2: 日本語名の収集（op.gg）

**Files:**
- Create: `scripts/furniture/raw/opgg-names.json`

**Interfaces:**
- Produces: `opgg-names.json` = `{ [slug: string]: string }`（日本語名）

- [ ] **Step 1:** ブラウザ（Claude in Chrome またはアプリ内ブラウザ）で https://op.gg/ja/pokemon-pokopia/items を開き「すべて表示」を押して、全アイテムの「日本語名 ↔ リンクのスラッグ」を `get_page_text`/`javascript_tool` で取り出し保存する
- [ ] **Step 2:** 確認: Task 1 のうち `tag !== null` のアイテムで、`opgg-names.json` に無い slug を一覧で出す。無いものは Bulbapedia の個別ページ（日本語名あり）で補い、`opgg-names.json` に追記する

### Task 3: 家具 JSON の組み立てと確認用 CSV

**Files:**
- Create: `scripts/furniture/merge.mjs`
- Create: `scripts/furniture/merge.test.mjs`
- Create: `scripts/furniture/build-data.mjs`
- Create: `src/data/furniture.json`
- Create: `scripts/furniture/review.csv`
- Create: `scripts/furniture/image-urls.json`

**Interfaces:**
- Consumes: Task 1・2 の JSON
- Produces: `mergeFurniture(serebii, names, favMap) -> { items: FurnitureItem[]; missing: { slug: string; reason: "no-name" | "no-favorite" }[] }`（`merge.mjs` の named export）
- Produces: `src/data/furniture.json` = `FurnitureItem[]`（形は spec 6.1。`image` は `"<slug>.png"`、この時点では全件ファイル名を入れ、Task 4 で取れなかったものを null にする）
- Produces: `image-urls.json` = `{ [slug]: url }`

- [ ] **Step 1: Write the failing test** `merge.test.mjs`（vitest）
  - `it("分類なし（素材など）は除外する")`: tag null のアイテムは items に入らない
  - `it("favorites を code に変換し昇順にする")`: `["Wooden stuff","Soft stuff"]` → `[45, 47]`
  - `it("日本語名が無いものは items に入れず missing に no-name で出す")`
  - `it("日本語名の順に並ぶ")`: `localeCompare(…, "ja")`
- [ ] **Step 2:** Run `npx vitest run scripts/furniture` → FAIL（mergeFurniture が無い）
- [ ] **Step 3:** `mergeFurniture` を実装。`build-data.mjs` は raw を読み `mergeFurniture` を呼び、`src/data/furniture.json`（2 スペースインデント）、`review.csv`（UTF-8 BOM 付き、列: 日本語名, 英語名, 分類, 属性（日本語・スペース区切り）, slug）、`image-urls.json` を書き、missing を表示する
- [ ] **Step 4:** Run `npx vitest run scripts/furniture` → PASS。`node scripts/furniture/build-data.mjs` を実行し件数と missing を確認
- [ ] **Step 5（ユーザー確認）:** `review.csv` をユーザーに送り、件数・名前・属性に違和感がないか見てもらう。直しは raw か `scripts/furniture/overrides.json`（`{ [slug]: Partial<FurnitureItem> }`、merge の最後に上書き。必要になったら追加し、テストを 1 つ足す）で行う
- [ ] **Step 6:** コミット用コマンドを用意: `git add scripts/furniture src/data/furniture.json` / `git commit -m "feat: 家具データ（属性・日本語名）を追加"`

### Task 4: 家具画像の取得スクリプト

**Files:**
- Create: `scripts/furniture/download-images.mjs`
- Create: `public/furniture/*.png`
- Modify: `src/data/furniture.json`（取れなかったものの `image` を null）

**Interfaces:**
- Consumes: `scripts/furniture/image-urls.json`
- Produces: `public/furniture/<slug>.png`、`scripts/furniture/missing-images.json`（slug の配列）

- [ ] **Step 1:** `download-images.mjs` を実装: 各 URL を `fetch`（User-Agent に `pocoapoke-personal`）、同時 4 件まで、1 件ごとに 200ms 待つ。sharp で `.trim().png({ palette: true })` して保存、既にあればスキップ。失敗は `missing-images.json` に書く。最後に `src/data/furniture.json` の該当 `image` を null にする
- [ ] **Step 2:** `node --check` で構文確認後、ユーザーに PC の PowerShell で `node scripts/furniture/download-images.mjs` を実行してもらう
- [ ] **Step 3:** 確認: 画像数 + missing 数 = 家具数。数件を Read で見て透明の切り抜きが正しいか確認。missing はユーザーに一覧で伝え、スクショがあれば `pocoapoke-add-icon` の手順で `public/furniture/<slug>.png` に追加
- [ ] **Step 4:** コミット用コマンド: `git add scripts/furniture public/furniture src/data/furniture.json` / `git commit -m "feat: 家具の画像を追加"`

### Task 5: 家具ロジック（`src/lib/furniture.ts`）

**Files:**
- Create: `src/lib/furniture.ts`
- Create: `src/lib/furniture.test.ts`
- Modify: `src/types.ts`（`FurnitureItem` を追加）

**Interfaces:**
- Produces（`src/types.ts`）: `type FurnitureItem = { slug: string; name: string; en: string; tag: string; favorites: number[]; image: string | null }`
- Produces（`src/lib/furniture.ts`）:
  - `favoriteCodes(p: Pokemon, favById: Map<number, MasterItem>): number[]` — favorite_ids の先頭 5 つ（味を除く）を code にする。null・不明 id は除く
  - `normalizeKana(s: string): string` — NFKC → ひらがなをカタカナに → 小文字
  - `filterFurniture(items: FurnitureItem[], opts: { query: string; code: number | null }): FurnitureItem[]` — 名前（日本語・英語）の部分一致（normalizeKana 同士）かつ属性 code を含む。順番は入力のまま
  - `type Pick = { pokemon: Pokemon; codes: number[] }`
  - `type RankedFurniture = { item: FurnitureItem; total: number; kinds: number[]; perPokemon: { pokemon: Pokemon; codes: number[] }[] }`（`kinds` は当てはまった属性 code の重複なし昇順、`perPokemon` は当てはまりが 1 以上のポケモンだけ、picks の順）
  - `rankFurniture(items: FurnitureItem[], picks: Pick[]): RankedFurniture[]` — total 0 を除き、total 降順 → kinds.length 降順 → name の `localeCompare(…, "ja")`
  - `pokemonWhoLike(code: number, all: Pokemon[], favById: Map<number, MasterItem>): Pokemon[]` — favoriteCodes に code を含むポケモンを `defaultPokemonCompare` 順で

- [ ] **Step 1: Write the failing tests**（`progress.test.ts` の `poke()`/`m()` と同じ作り方のヘルパーを使う）
  - `favoriteCodes`: `[10,11,null,99,12,3]`（99 は不明、3 は味の位置）→ 10〜12 に対応する code だけ
  - `normalizeKana`: `"いす"` と `"イス"` が等しい、`"ＡＢｃ"` → `"abc"`
  - `filterFurniture`: `query "いす"` でカタカナ「…イス」が当たる / 英語名でも当たる / `code` 指定で属性を含むものだけ / 空 query・null code なら全件
  - `rankFurniture`: A（木製・やわらかい）と B（木製）を選び、家具 X（木製・やわらかい）→ total 3・kinds [木製, やわらかい]、家具 Y（木製）→ total 2・kinds [木製]、家具 Z（当てはまりなし）は出ない。順番 X, Y
  - `rankFurniture`: total が同じなら kinds が多い方が先、さらに同じなら名前順
  - `rankFurniture`: 好きなものが空のポケモンだけを選ぶと結果は空（落ちない）
  - `pokemonWhoLike`: 番号順で返す、味の位置の code は対象外
- [ ] **Step 2:** Run `npx vitest run src/lib/furniture.test.ts` → FAIL
- [ ] **Step 3:** 実装（上の Interfaces の通り）
- [ ] **Step 4:** Run `npx vitest run` → 全部 PASS
- [ ] **Step 5:** コミット用コマンド: `git add src/types.ts src/lib/furniture.ts src/lib/furniture.test.ts` / `git commit -m "feat: 家具の絞り込み・順位づけロジック"`

### Task 6: 家具ページ「家具から」とタブ追加

**Files:**
- Create: `src/components/FurnitureIcon.tsx`
- Create: `src/components/FurnitureCard.tsx`
- Create: `src/components/LikersSheet.tsx`
- Create: `src/pages/Furniture.tsx`
- Modify: `src/App.tsx`（`/furniture` を `React.lazy` + `Suspense` で追加）
- Modify: `src/components/TabBar.tsx`（「家具」🪑 を住みごこちと登録の間に追加）

**Interfaces:**
- Consumes: Task 5 の関数・型、`usePokemonData`、`AppHeader`、`FilterSheet`、`BottomSheet`、`PokemonIcon`
- Produces:
  - `FurnitureIcon({ item: FurnitureItem; size?: number })` — `/furniture/<image>` を表示。`image` が null か `onError` で灰色の角丸枠＋「🪑」
  - `FurnitureCard({ item: FurnitureItem; labelByCode: Map<number, string>; highlight: Set<number>; perPokemon?: RankedFurniture["perPokemon"]; total?: number; onTapFavorite: (code: number) => void })` — 画像 48px・名前・属性チップ（highlight は青）。`perPokemon` があればポケモンごとに小アイコン＋当てはまった属性、`total` があれば右上に「★ total」
  - `LikersSheet({ code: number | null; label: string; pokemon: Pokemon[]; onClose: () => void })` — 「〇〇が好きなポケモン」。行はアイコン・名前・`TOWN_SHORT` の街
  - `Furniture` ページ: `mode: "items" | "pokemon"` の切り替え（この Task では "items" のみ中身を作り、"pokemon" は Task 7）

- [ ] **Step 1:** `FurnitureIcon`・`FurnitureCard`・`LikersSheet` を作る
- [ ] **Step 2:** `Furniture.tsx`: AppHeader（title「家具さがし」、subtitle「好きなものに合う家具をさがす」、count=表示件数）、ヘッダー下に「家具から / ポケモンから」の切り替え（住みごこち画面の「住みごこち順/番号順」と同じ見た目）。「家具から」は名前検索の入力欄と「属性 ▼」ボタン（FilterSheet、items は master.favorite の code 6〜48）、`filterFurniture` の結果を FurnitureCard で表示。チップタップで LikersSheet。最下部に Global Constraints の出典文言
- [ ] **Step 3:** App.tsx にルート、TabBar にタブを追加
- [ ] **Step 4:** Run `npm run build` → 成功。`npm run dev`（API はモックせず、ビルド確認とレイアウト確認のみ。データが要る確認は Task 8）
- [ ] **Step 5:** コミット用コマンド: `git add src` / `git commit -m "feat: 家具タブ（家具から探す・属性が好きなポケモン）"`

### Task 7: 「ポケモンから」と住みごこちからの入口

**Files:**
- Create: `src/components/PokemonPicker.tsx`
- Modify: `src/pages/Furniture.tsx`
- Modify: `src/components/ProgressSheet.tsx`（「家具をさがす」ボタン）

**Interfaces:**
- Consumes: `rankFurniture`, `favoriteCodes`, `FurnitureCard`
- Produces:
  - `PokemonPicker({ all: Pokemon[]; towns: MasterItem[]; selected: number[]; onChange: (ids: number[]) => void })` — 街チップ（未登録=0 を含む、`localStorage` の住みごこち画面の街 `pocoapoke.progress.town` を初期値）で絞り、各ポケモンにチェック。選択中は上に小アイコンで並べ、タップで外す
  - URL: `/furniture?poke=<id>` で開くと mode="pokemon"、そのポケモンを選択済み。id が数でない・存在しないときは無視

- [ ] **Step 1:** `PokemonPicker` を作る
- [ ] **Step 2:** `Furniture.tsx` の "pokemon" モード: 選択（`useState<number[]>`、保存しない）→ `rankFurniture` → FurnitureCard（highlight=kinds、perPokemon、total）。選択 0 件なら「ポケモンを選んでください」。`useSearchParams` で `poke` を読む（Review Focus 4）
- [ ] **Step 3:** ProgressSheet に「家具をさがす」ボタン（`navigate("/furniture?poke=" + id)`）
- [ ] **Step 4:** Run `npx vitest run` と `npm run build` → 成功
- [ ] **Step 5:** コミット用コマンド: `git add src` / `git commit -m "feat: ポケモンから家具をさがす（複数選択）、住みごこちからの入口"`

### Task 8: 実データでの動作確認

- [ ] **Step 1:** クラウドで `npm run build` → `npx vite preview` を起動し、`/api/*` は本番 https://pocoapoke.pages.dev へ転送する設定（preview の proxy）で開く
- [ ] **Step 2:** Playwright で 390×844 の画面を撮る: 家具から（全件、「いす」検索、属性絞り込み、LikersSheet）、ポケモンから（2 匹選択）、`?poke=abc`、`?poke=<実在id>`、タブバー 4 つ。画像なし家具の表示も 1 件確認
- [ ] **Step 3:** スクショをユーザーに送り、気になる点を直す
- [ ] **Step 4:** 変わったファイルをユーザーの PC に書き戻し、まとめのコミット・push コマンドを渡す。CLAUDE.md の「構成」に家具タブと `src/data/furniture.json`・`scripts/furniture/` を 1 行ずつ追記
