import { json } from '../_utils.js';

export async function onRequestDelete({ params, env }) {
  await env.DB.prepare('DELETE FROM water_changes WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
