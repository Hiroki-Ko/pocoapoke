// functions/getInitialData.ts
export async function onRequestGet({ env }) {
  const db = env.DB;

  const pokemon = await db.prepare(`SELECT ...`).all();
  const masterCodes = await db.prepare(`SELECT ...`).all();

  return Response.json({
    pokemon,
    masterCodes,
  });
}
