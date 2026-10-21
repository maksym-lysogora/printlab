// Vercel function: пересилає замовлення і 3D-файл вам у Telegram
export async function POST(request) {
  let form;
  try { form = await request.formData(); } catch { return Response.json({ error: 'bad request' }, { status: 400 }); }
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID: chat_id } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !chat_id) return Response.json({ error: 'not configured' }, { status: 503 });

  const tg = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
  const f = k => String(form.get(k) || '—').slice(0, 800);
  const caption =
`🖨 Нове замовлення
Ім'я: ${f('name')}
Контакт: ${f('contact')}
Режим: ${form.get('mode') === 'ready' ? 'готова модель, лише друк' : 'потрібна адаптація'}
Оцінка: ${f('estimate')}
Коментар: ${f('comment')}`;

  try {
    const file = form.get('file');
    let r;
    if (file && file.size) {
      const fd = new FormData();
      fd.append('chat_id', chat_id);
      fd.append('caption', caption.slice(0, 1024));
      fd.append('document', file, file.name);
      r = await fetch(`${tg}/sendDocument`, { method: 'POST', body: fd });
    } else {
      r = await fetch(`${tg}/sendMessage`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id, text: caption })
      });
    }
    if (!r.ok) throw new Error(await r.text());
    return Response.json({ ok: true });
  } catch (e) {
    console.error('order failed:', e.message);
    return Response.json({ error: 'send failed' }, { status: 502 });
  }
}
