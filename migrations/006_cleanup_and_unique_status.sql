-- 使っていないカラム・選択肢の削除と、pokemon_status.poke_id の重複禁止（UNIQUE）
-- 実行前に Time Travel のブックマークを控えておくこと（問題があればその時点に戻す）
--   npx wrangler d1 time-travel info pocoapoke
--
-- pokemon_status は today_wish が master_code を参照しているため DROP COLUMN できない。
-- テーブルを作り直し、poke_id を UNIQUE にする。重複があれば id が新しい行を残す。
PRAGMA defer_foreign_keys = true;

CREATE TABLE pokemon_status_new (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  poke_id       INTEGER NOT NULL UNIQUE,
  status_code   INTEGER NOT NULL,
  place_code    INTEGER NOT NULL,
  cared_on      TEXT,    -- 最後にお世話した日（ゲーム日付 YYYY-MM-DD）
  wish_favorite INTEGER, -- 今日の欲しいもの（master_code favorite の id）
  wish_on       TEXT,    -- 欲しいものを入力した日（ゲーム日付）
  created_at    TEXT,
  updated_at    TEXT,
  FOREIGN KEY (poke_id)       REFERENCES pokemon_ms(id),
  FOREIGN KEY (status_code)   REFERENCES master_code(id),
  FOREIGN KEY (place_code)    REFERENCES master_code(id),
  FOREIGN KEY (wish_favorite) REFERENCES master_code(id)
);

INSERT INTO pokemon_status_new (id, poke_id, status_code, place_code, cared_on, wish_favorite, wish_on, created_at, updated_at)
SELECT id, poke_id, status_code, place_code, cared_on, wish_favorite, wish_on, created_at, updated_at
FROM pokemon_status
WHERE id IN (SELECT MAX(id) FROM pokemon_status GROUP BY poke_id);

DROP TABLE pokemon_status;
ALTER TABLE pokemon_status_new RENAME TO pokemon_status;

-- 以前の「欲しいもの」選択肢（today_wish 用）は使わない
DELETE FROM master_code WHERE class IN ('category', 'wish');

-- 論理削除は使っていない
ALTER TABLE pokemon_ms DROP COLUMN deleted_at;
ALTER TABLE master_code DROP COLUMN deleted_at;
