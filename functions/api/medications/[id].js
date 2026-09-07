import { json, errorResponse, str, readJson } from '../_utils.js';

export async function onRequestDelete({ params, env }) {
  await env.DB.prepare('DELETE FROM medications WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}

export async function onRequestPut({ params, request, env }) {
  const body = await readJson(request);
  if (!body || !str(body.date) || !str(body.medication)) {
    return errorResponse('date and medication are required');
  }

  await env.DB.prepare(
    `UPDATE medications SET date = ?, medication = ?, dose = ?, reason = ?, notes = ? WHERE id = ?`
  )
    .bind(str(body.date), str(body.medication), str(body.dose), str(body.reason), str(body.notes), params.id)
    .run();

  return json({
    id: params.id,
    date: str(body.date),
    medication: str(body.medication),
    dose: str(body.dose),
    reason: str(body.reason),
    notes: str(body.notes),
  });
}
