export async function onRequestPost(context) {
  const { env } = context;

  const { results } = await env.DB
    .prepare(`
        INSERT INTO pokemon_ms
            (
                number,
                name,
                specialty1,
                specialty2,
                environment,
                favorite1, favorite2, favorite3, favorite4, favorite5,
                favorite6,
                created_at
            )
        VALUES
            (
                1,
                'フシギダネ',
                (SELECT id FROM master_code WHERE class='specialty' AND code=2),
                null,
                (SELECT id FROM master_code WHERE class='environment' AND code=5),
                null, null, null, null, null,
                (SELECT id FROM master_code WHERE class='favorite' AND code=1),
                datetime('now')
            )
        `)
}