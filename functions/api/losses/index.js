import { json, errorResponse, uid, num, str, readJson, requireTankIdFromUrl } from '../_utils.js';

export async function onRequestGet({ request, env }) {
    const tankId = requireTankIdFromUrl(request);
    if (!tankId) return errorResponse('tank_id is required');

  const { results } = await env.DB.prepare(
        'SELECT id, date, species, quantity, cause, notes FROM losses WHERE tank_id = ? ORDER BY date DESC, created_at DESC'
      ).bind(tankId).all();
    return json(results);
}

export async function onRequestPost({ request, env }) {
    const body = await readJson(request);
    const tankId = body ? str(body.tankId) : null;
    if (!tankId) return errorResponse('tankId is required');
    if (!body || !str(body.date) || !str(body.species)) {
          return errorResponse('date and species are required');
    }

  const id = uid();
    const quantity = num(body.quantity) ?? 1;
    await env.DB.prepare(
          `INSERT INTO losses (id, date, species, quantity, cause, notes, tank_id) VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
      .bind(id, str(body.date), str(body.species), quantity, str(body.cause), str(body.notes), tankId)
      .run();

  return json({
        id,
        date: str(body.date),
        species: str(body.species),
        quantity,
        cause: str(body.cause),
        notes: str(body.notes),
  }, 201);
}
