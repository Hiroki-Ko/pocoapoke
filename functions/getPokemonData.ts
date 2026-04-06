// functions/getPokemonData.ts
export async function getPokemonData(env) {
  const { results } = await env.DB
    .prepare(`
      SELECT
        p.id,
        p.number,
        p.name,
        s1.label AS specialty1_label,
        s2.label AS specialty2_label,
        e1.label AS environment_label,
        f1.label AS favorite1_label,
        f2.label AS favorite2_label,
        f3.label AS favorite3_label,
        f4.label AS favorite4_label,
        f5.label AS favorite5_label,
        f6.label AS favorite6_label
      FROM pokemon_ms p
      LEFT JOIN master_code s1 ON p.specialty1 = s1.id
      LEFT JOIN master_code s2 ON p.specialty2 = s2.id
      LEFT JOIN master_code e1 ON p.environment = e1.id
      LEFT JOIN master_code f1 ON p.favorite1 = f1.id
      LEFT JOIN master_code f2 ON p.favorite2 = f2.id
      LEFT JOIN master_code f3 ON p.favorite3 = f3.id
      LEFT JOIN master_code f4 ON p.favorite4 = f4.id
      LEFT JOIN master_code f5 ON p.favorite5 = f5.id
      LEFT JOIN master_code f6 ON p.favorite6 = f6.id
    `)
    .all();

    // ここで配列に変換
    const mapped = results.map((row) => {
    const favorites = [
        row.favorite1_label,
        row.favorite2_label,
        row.favorite3_label,
        row.favorite4_label,
        row.favorite5_label,
        row.favorite6_label,
    ].filter((v) => v != null);

    return {
        id: row.id,
        number: row.number,
        name: row.name,
        specialty1: row.specialty1_label,
        specialty2: row.specialty2_label,
        environment: row.environment_label,
        favorites,
    };
    });

    return mapped;

}

