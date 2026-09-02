import { json, errorResponse, num, str, readJson } from '../_utils.js';

export async function onRequestDelete({ params, env }) {
  await env.DB.prepare('DELETE FROM water_tests WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}

export async function onRequestPut({ params, request, env }) {
  const body = await readJson(request);
  if (!body || !str(body.date)) return errorResponse('date is required');

  await env.DB.prepare(
    `UPDATE water_tests SET date = ?, ph = ?, ammonia = ?, nitrite = ?, nitrate = ?, temp = ?, notes = ? WHERE id = ?`
  )
    .bind(str(body.date), num(body.ph), num(body.ammonia), num(body.nitrite), num(body.nitrate), num(body.temp), str(body.notes), params.id)
    .run();

  return json({
    id: params.id,
    date: str(body.date),
    ph: num(body.ph),
    ammonia: num(body.ammonia),
    nitrite: num(body.nitrite),
    nitrate: num(body.nitrate),
    temp: num(body.temp),
    notes: str(body.notes),
  });
}
