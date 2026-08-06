-- pokemon_ms に category / local_number を追加
-- schema.sql は先行して更新されていたが、マイグレーションが漏れていたため追加
ALTER TABLE pokemon_ms ADD COLUMN category TEXT NOT NULL DEFAULT 'main';
ALTER TABLE pokemon_ms ADD COLUMN local_number INTEGER;
