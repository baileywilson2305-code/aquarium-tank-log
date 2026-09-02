import { json, errorResponse, num, str, readJson } from '../_utils.js';

export async function onRequestDelete({ params, env }) {
  await env.DB.prepare('DELETE FROM equipment WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}

export async function onRequestPut({ params, request, env }) {
  const body = await readJson(request);
  if (!body || !str(body.date) || !str(body.item)) {
    return errorResponse('date and item are required');
  }

  await env.DB.prepare(
    `UPDATE equipment SET date = ?, item = ?, cost = ?, wattage = ?, hours_per_day = ?, notes = ? WHERE id = ?`
  )
    .bind(str(body.date), str(body.item), num(body.cost), num(body.wattage), num(body.hoursPerDay), str(body.notes), params.id)
    .run();

  return json({
    id: params.id,
    date: str(body.date),
    item: str(body.item),
    cost: num(body.cost),
    wattage: num(body.wattage),
    hoursPerDay: num(body.hoursPerDay),
    notes: str(body.notes),
  });
}
