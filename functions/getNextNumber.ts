export async function onRequestGet({ env }) {
  const { results } = await env.DB
    .prepare("SELECT MAX(number) AS max FROM pokemon_ms")
    .all();

  const next = (results[0]?.max ?? 0) + 1;

  return Response.json({ next });
}
