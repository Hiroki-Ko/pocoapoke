# pocoapoke

ゲーム「ぽこあポケモン」のおともアプリ。ポケモンごとの住んでる街・住みごこち・好きなもの・お世話をスマホ（Android の Chrome）で確認・更新する。

## 返答のルール
- 日本語の文と英語の文を1文ずつ交互に書く（英語の練習のため）。報告・リスト・手順も例外なし。

## 構成
- フロント: React 19 + Vite + Tailwind CSS v4（MUI は削除済み）。データ取得は TanStack Query
- API: Cloudflare Pages Functions（`functions/api/*.ts`）。`functions/` には `onRequest*` を持つファイルだけを置く（共通処理は `functions/lib/`、定数は `src/`）
- DB: Cloudflare D1（db 名 `pocoapoke`）。スキーマは `seeds/schema.sql`、変更は `migrations/` に連番で追加
- 本番: https://pocoapoke.pages.dev （master に push すると自動デプロイ）
- 画面: 一覧 `/`、住みごこち `/progress`、登録 `/register`、編集 `/edit/:id`
- ホーム画面にインストールできる（`public/manifest.webmanifest`、`theme-color` は #ffd84d）

## 開発
- `npm install` → `npx wrangler pages dev`（API, :8788）と `npm run dev`（Vite, /api を 8788 へ転送）
- テスト: `npm test`（vitest、`src/lib/*.test.ts`）
- 変更後は `npm run build` が通ることを確認する

## 作業の約束
- `git push` と本番 D1 へのコマンド（`wrangler ... --remote`）は本人が自分のターミナルで実行する。Claude は変更とコミットの準備まで
- 画像の切り抜きなどのファイル作業は、本人が PC から指示したときに行う（スマホからの指示中は確認だけ）
- 本番 D1 を変える前に Time Travel のブックマークを控える

## 仕様のポイント
- ゲーム内の1日は 4:00 に切り替わる（`src/lib/gameDay.ts`）。お世話チェック・欲しいものは日付（`cared_on` / `wish_on`）で保存し、4:00 で自動リセット
- お世話チェックは □ をタップしたときだけ変わる。住みごこち「最高」はお世話不要なので、お世話の数・進捗バーから外し「最高○匹」として別に表示
- 欲しいものの選択肢は、そのポケモンの好きなもの5つ（`favorite1`〜`5`、`favorite6` は味）
- 名前・すがた名はゲーム内の図鑑に合わせる（〜なすがた、オスのすがた／メスのすがた）

## アイコン
- ゲーム内アイコン（優先）: `public/icons/custom/<pokemon_ms.id>.png`、名前で決まるものは `public/icons/custom/key-<画像キー>.png`
- 予備: PokeAPI のスプライトを余白を切って `public/icons/<key>.png` に保存
- 追加・変更したら `node scripts/build-icons.mjs` で `src/data/customIcons.json` などを作り直す（ファビコン・アプリアイコンもここで作られる）
- アプリのアイコン: ホーム画面・起動画面とも、公式配布画像から切り抜いたフワンテ＆メタモン（`icon-maskable-512.png`、元画像は `scripts/assets/drifloon-ditto.png`）。Android 12 以降は起動画面にホーム画面のアイコンが出るため、起動画面だけ別にはできない

## バックアップ
- 毎月1日の GitHub Action が `seeds/pokemon_ms.json` と完全バックアップ `seeds/backup/pocoapoke-data.json` を保存（`scripts/backup-to-sql.cjs` で SQL に戻せる）
- 設計・計画の記録は `docs/superpowers/`
