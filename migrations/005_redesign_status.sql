-- デザイン一新: お世話日・今日の欲しいもの・住みごこち画面への表示フラグ
-- 既存データは変更しない（列追加のみ）。今日のお世話/欲しいものは日付付きで保存し、
-- ゲーム日付（JST 4:00 切り替え）と一致する場合のみ有効として扱う。
ALTER TABLE pokemon_status ADD COLUMN cared_on TEXT;
ALTER TABLE pokemon_status ADD COLUMN wish_favorite INTEGER REFERENCES master_code(id);
ALTER TABLE pokemon_status ADD COLUMN wish_on TEXT;
ALTER TABLE pokemon_ms ADD COLUMN show_in_progress INTEGER NOT NULL DEFAULT 1;
UPDATE pokemon_ms SET show_in_progress = 0
  WHERE name IN ('モジャンボ','カイオーガ','ルギア','ホウオウ','メタモン');
