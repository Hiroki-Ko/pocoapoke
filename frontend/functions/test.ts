// export async function onRequestGet(context) {
//   await context.env.POKEMON.put("test", "hello world")
//   const value = await context.env.POKEMON.get("test")
//   return new Response(value)
// }

export async function onRequestGet(context) {
  return new Response("OK: functions working")
}
