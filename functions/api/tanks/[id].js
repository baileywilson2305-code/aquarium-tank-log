import { json, errorResponse, str, readJson } from '../_utils.js';

export async function onRequestPut({ params, request, env }) {
  const body = await readJson(request);
  const name = body ? str(body.name) : null;
  if (!name) return errorResponse('name is required');

  await env.DB.prepare('UPDATE tanks SET name = ? WHERE id = ?').bind(name, params.id).run();
  return json({ id: params.id, name });
}
