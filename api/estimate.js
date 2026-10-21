// Vercel function: оцінка грамів і годин друку за скріншотом через Claude API
const MAX_IMAGE = 3_000_000; // ~3 МБ base64, захист від зловживань

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'bad request' }, { status: 400 }); }
  const { image, dims, material, colors, desc } = body || {};
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: 'no key' }, { status: 503 });

  const content = [];
  if (typeof image === 'string' && image.length < MAX_IMAGE) {
    const [, mediaType, data] = image.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/) || [];
    if (data) content.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data } });
  }
  content.push({
    type: 'text',
    text: `Ти — експерт з FDM 3D-друку (Bambu Lab, сопло 0.4, шар 0.2 мм, заповнення 15%, стінки 2).
Оціни за зображенням і даними, скільки філаменту (грамів, включно з підтримками та відходами на зміну кольорів) і годин друку знадобиться.
Габарити: ${String(dims || '').slice(0, 100) || 'невідомі — оціни з контексту, для архітектурного макета типово 150–300 мм'}
Матеріал: ${material === 'PETG' ? 'PETG' : 'PLA'}. Кольорів: ${Math.min(4, Math.max(1, +colors || 1))}. Опис: ${String(desc || '—').slice(0, 300)}
Відповідай ЛИШЕ JSON: {"grams": число, "hours": число, "comment": "1-2 речення українською про модель і що впливає на ціну"}`
  });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-5-5',
        max_tokens: 400,
        messages: [{ role: 'user', content }]
      })
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error?.message || 'API error');
    const text = j.content.find(c => c.type === 'text')?.text || '';
    const est = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    return Response.json({
      grams: Math.max(5, Math.round(+est.grams)),
      hours: Math.max(0.5, Math.round(+est.hours * 10) / 10),
      comment: est.comment
    });
  } catch (e) {
    console.error('estimate failed:', e.message);
    return Response.json({ error: 'оцінка недоступна' }, { status: 502 });
  }
}
