import { json, errorResponse, uid, num, str, readJson, requireTankIdFromUrl } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const tankId = requireTankIdFromUrl(request);
  if (!tankId) return errorResponse('tank_id is required');

  const { results } = await env.DB.prepare(
    `SELECT id, date, item, cost, notes,
            wattage, hours_per_day AS hoursPerDay
     FROM equipment WHERE tank_id = ? ORDER BY date DESC, created_at DESC`
  ).bind(tankId).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const tankId = body ? str(body.tankId) : null;
  if (!tankId) return errorResponse('tankId is required');
  if (!body || !str(body.date) || !str(body.item)) {
    return errorResponse('date and item are required');
  }

  const id = uid();
  await env.DB.prepare(
    `INSERT INTO equipment (id, date, item, cost, notes, wattage, hours_per_day, tank_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      str(body.date),
      str(body.item),
      num(body.cost),
      str(body.notes),
      num(body.wattage),
      num(body.hoursPerDay),
      tankId
    )
    .run();

  return json(
    {
      id,
      date: str(body.date),
      item: str(body.item),
      cost: num(body.cost),
      notes: str(body.notes),
      wattage: num(body.wattage),
      hoursPerDay: num(body.hoursPerDay),
    },
    201
  );
}
