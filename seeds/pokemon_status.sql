-- PokemonStatus INSERT
-- pokemon_ms の全レコードに対して 1対1 で初期ステータスを登録する
-- status_code: evaluation code=0 (未登録)
-- place_code:  place code=0 (未登録)
-- today_wish:  wish code=0 (None)
DELETE FROM pokemon_status;
INSERT INTO pokemon_status
  (
    poke_id,
    status_code,
    place_code,
    today_wish,
    created_at
  )
SELECT
  pm.id,
  (SELECT id FROM master_code WHERE class='evaluation' AND code=0),
  (SELECT id FROM master_code WHERE class='place'      AND code=0),
  (SELECT id FROM master_code WHERE class='wish'       AND code=0),
  datetime('now')
FROM pokemon_ms pm;
