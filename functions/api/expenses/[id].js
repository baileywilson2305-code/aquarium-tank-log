import { json, errorResponse, num, str, readJson } from '../_utils.js';

export async function onRequestPut({ params, request, env }) {
  const body = await readJson(request);
  if (!body || !str(body.date) || !str(body.item)) {
    return errorResponse('date and item are required');
  }

  await env.DB.prepare(
    `UPDATE expenses SET date = ?, category = ?, item = ?, cost = ?, notes = ? WHERE id = ?`
  )
    .bind(str(body.date), str(body.category), str(body.item), num(body.cost), str(body.notes), params.id)
    .run();

  return json({
    id: params.id,
    date: str(body.date),
    category: str(body.category),
    item: str(body.item),
    cost: num(body.cost),
    notes: str(body.notes),
  });
}

export async function onRequestDelete({ params, env }) {
  await env.DB.prepare('DELETE FROM expenses WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
