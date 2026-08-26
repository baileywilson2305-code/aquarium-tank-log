import { json, errorResponse, uid, str, readJson } from '../_utils.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, sort_order AS sortOrder FROM tanks ORDER BY sort_order ASC, created_at ASC'
  ).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  if (!body || !str(body.name)) return errorResponse('name is required');

  const { results } = await env.DB.prepare('SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM tanks').all();
  const nextOrder = (results[0] && typeof results[0].maxOrder === 'number' ? results[0].maxOrder : -1) + 1;

  const id = uid();
  await env.DB.prepare('INSERT INTO tanks (id, name, sort_order) VALUES (?, ?, ?)')
    .bind(id, str(body.name), nextOrder)
    .run();

  return json({ id, name: str(body.name), sortOrder: nextOrder }, 201);
}
