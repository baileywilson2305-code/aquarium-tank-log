import { json, errorResponse, num, str, readJson } from '../_utils.js';

export async function onRequestDelete({ params, env }) {
  await env.DB.prepare('DELETE FROM fish WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}

export async function onRequestPut({ params, request, env }) {
  const body = await readJson(request);
  if (!body || !str(body.dateAdded) || !str(body.species)) {
    return errorResponse('dateAdded and species are required');
  }

  const quantity = num(body.quantity) ?? 1;
  const cost = num(body.cost);
  await env.DB.prepare(
    `UPDATE fish SET date_added = ?, species = ?, name = ?, quantity = ?, cost = ?, notes = ? WHERE id = ?`
  )
    .bind(str(body.dateAdded), str(body.species), str(body.name), quantity, cost, str(body.notes), params.id)
    .run();

  return json({
    id: params.id,
    dateAdded: str(body.dateAdded),
    species: str(body.species),
    name: str(body.name),
    quantity,
    cost,
    notes: str(body.notes),
  });
}
