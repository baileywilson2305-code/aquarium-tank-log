import { json, errorResponse, uid, num, str, readJson, requireTankIdFromUrl } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const tankId = requireTankIdFromUrl(request);
  if (!tankId) return errorResponse('tank_id is required');

  const { results } = await env.DB.prepare(
    'SELECT id, date_added AS dateAdded, species, name, quantity, cost, notes FROM fish WHERE tank_id = ? ORDER BY date_added DESC, created_at DESC'
  ).bind(tankId).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const tankId = body ? str(body.tankId) : null;
  if (!tankId) return errorResponse('tankId is required');
  if (!body || !str(body.dateAdded) || !str(body.species)) {
    return errorResponse('dateAdded and species are required');
  }

  const id = uid();
  const quantity = num(body.quantity) ?? 1;
  const cost = num(body.cost);
  await env.DB.prepare(
    `INSERT INTO fish (id, date_added, species, name, quantity, cost, notes, tank_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, str(body.dateAdded), str(body.species), str(body.name), quantity, cost, str(body.notes), tankId)
    .run();

  return json({
    id,
    dateAdded: str(body.dateAdded),
    species: str(body.species),
    name: str(body.name),
    quantity,
    cost,
    notes: str(body.notes),
  }, 201);
}
