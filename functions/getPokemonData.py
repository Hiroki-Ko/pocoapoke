# functions/getPokemonData.py
from js import Response
import json

async def on_request_get(request, env):
    rows = await env.DB.prepare(
        "SELECT * FROM pokemon_ms"
    ).all()
    
    return Response.new(json.dumps(rows), {
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        }
    })