import { json, errorResponse, num, str, readJson } from '../_utils.js';

export async function onRequestDelete({ params, env }) {
  await env.DB.prepare('DELETE FROM water_changes WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}

export async function onRequestPut({ params, request, env }) {
  const body = await readJson(request);
  if (!body || !str(body.date)) return errorResponse('date is required');

  await env.DB.prepare(
    `UPDATE water_changes SET date = ?, percent = ?, notes = ? WHERE id = ?`
  )
    .bind(str(body.date), num(body.percent), str(body.notes), params.id)
    .run();

  return json({ id: params.id, date: str(body.date), percent: num(body.percent), notes: str(body.notes) });
}
