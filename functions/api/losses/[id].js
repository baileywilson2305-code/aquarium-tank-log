import { json, errorResponse, num, str, readJson } from '../_utils.js';

export async function onRequestDelete({ params, env }) {
    await env.DB.prepare('DELETE FROM losses WHERE id = ?').bind(params.id).run();
    return json({ ok: true });
}

export async function onRequestPut({ params, request, env }) {
    const body = await readJson(request);
    if (!body || !str(body.date) || !str(body.species)) {
          return errorResponse('date and species are required');
    }

  const quantity = num(body.quantity) ?? 1;
    await env.DB.prepare(
          `UPDATE losses SET date = ?, species = ?, quantity = ?, cause = ?, notes = ? WHERE id = ?`
        )
      .bind(str(body.date), str(body.species), quantity, str(body.cause), str(body.notes), params.id)
      .run();

  return json({
        id: params.id,
        date: str(body.date),
        species: str(body.species),
        quantity,
        cause: str(body.cause),
        notes: str(body.notes),
  });
}
