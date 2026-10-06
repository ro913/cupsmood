// Cloudflare Pages Function: принимает заказ с сайта и шлёт его в Telegram.
// Переменные окружения (Settings > Variables): BOT_TOKEN, CHAT_ID

export async function onRequestPost({ request, env }) {
  const f = await request.formData();
  const g = k => String(f.get(k) || '').slice(0, 300);
  const modes = { both: 'фото и надпись', photo: 'только фото', text: 'только надпись' };

  const caption =
    `Новый заказ CupsMood\n` +
    `Печать: ${modes[g('mode')] || g('mode')}\n` +
    (g('text') ? `Надпись: ${g('text')}\n` : '') +
    `Цвет кружки: ${g('color')}\n` +
    `Тип: ${g('type')}\n` +
    `Имя: ${g('name')}\n` +
    `Контакт: ${g('contact')}\n` +
    (g('comment') ? `Пожелания: ${g('comment')}` : '');

  const photo = f.get('photo');
  const api = `https://api.telegram.org/bot${env.BOT_TOKEN}/`;
  let res;

  if (photo && typeof photo === 'object' && photo.size) {
    if (photo.size > 10 * 1024 * 1024) return new Response('too big', { status: 413 });
    const out = new FormData();
    out.append('chat_id', env.CHAT_ID);
    out.append('caption', caption.slice(0, 1024));
    out.append('photo', photo, photo.name || 'photo.jpg');
    res = await fetch(api + 'sendPhoto', { method: 'POST', body: out });
  } else {
    res = await fetch(api + 'sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text: caption }),
    });
  }
  return new Response(res.ok ? 'ok' : 'error', { status: res.ok ? 200 : 502 });
}
