-- pokemon_status.poke_id に UNIQUE インデックスを追加
-- 同じポケモンが二重登録されるのを防ぐ
-- ※ SQLite は ALTER TABLE で UNIQUE 制約を追加できないため CREATE UNIQUE INDEX で対応
CREATE UNIQUE INDEX IF NOT EXISTS idx_pokemon_status_poke_id ON pokemon_status(poke_id);
