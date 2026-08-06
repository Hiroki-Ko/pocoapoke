// /pocoapoke/functions/api/getNextLocalNumber.ts
export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  if (category !== "ex" && category !== "dlc") {
    return Response.json({ error: "category must be 'ex' or 'dlc'" }, { status: 400 });
  }

  const { results } = await env.DB
    .prepare("SELECT MAX(local_number) AS max FROM pokemon_ms WHERE category = ?")
    .bind(category)
    .all();

  const next = (results[0]?.max ?? 0) + 1;

  return Response.json({ next });
}
