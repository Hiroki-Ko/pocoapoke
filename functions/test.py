from js import Response

async def on_request_get(request, env):
    now = __import__("datetime").datetime.now().isoformat()

    await env.DB.prepare(
        "INSERT INTO test_counter (message, created_at) VALUES (?, ?)"
    ).bind("hello world", now).run()

    row = await env.DB.prepare(
        "SELECT id, message, created_at FROM test_counter ORDER BY id DESC LIMIT 1"
    ).first()
    
    return Response.new(f"{row['message']} {row['id']}", {
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        }
    })

