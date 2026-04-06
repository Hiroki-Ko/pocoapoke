// functions/getMasterCode.ts
import { MASTER_CLASS } from "./constants";

export async function getMasterCode(env) {

    const { results } = await env.DB
    .prepare(`
        SELECT id, class, code, label
        FROM master_code
        WHERE deleted_at IS NULL
        AND class IN (?, ?, ?)
        ORDER BY class, id
    `)
    .bind(
        MASTER_CLASS.SPECIALTY,
        MASTER_CLASS.ENVIRONMENT,
        MASTER_CLASS.FAVORITE
    )
    .all();


    // class ごとにまとめる
    const grouped = {};

    for (const row of results) {
        if (!grouped[row.class]) {
            grouped[row.class] = [];
        }
        grouped[row.class].push({
            id: row.id,
            code: row.code,
            label: row.label,
        });
    }

    return grouped;
}

