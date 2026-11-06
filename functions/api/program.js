// Cloudflare Pages Function: GET /api/program
// Citește programul din Gym Management App și îl întoarce ca JSON (cache 10 minute).
const SRC = 'https://ninjasport.gym-management-app.com/calendars/schedules';

function clean(s) {
  return s.replace(/<[^>]*>/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

export function parse(html) {
  const days = [];
  const boxes = html.split(/<div class=['"]col-md-2 schedule_box['"]>/).slice(1);
  for (const b of boxes) {
    const day = (b.match(/class=['"]h4['"]>([^<]*)</) || [])[1] || '';
    const date = (b.match(/class=['"]h5['"]>([^<]*)</) || [])[1] || '';
    const items = [];
    for (const c of b.split(/<div class=['"]schedule_content['"]/).slice(1)) {
      const lines = clean('<x ' + c);
      const L = lines.filter(l => !/^style=/.test(l));
      const it = { time: '', name: '', trainer: '', booked: null, cap: null };
      const txt = L.filter(l => !/^[<>]/.test(l));
      it.time = txt[0] || ''; it.name = txt[1] || '';
      for (const l of txt.slice(2)) {
        const m = l.match(/^(\d+)\s*\/\s*(\d+)$/);
        if (m) { it.booked = +m[1]; it.cap = +m[2]; }
        else if (!it.trainer && l !== '-' && !/Ninja Sport Gym/i.test(l)) it.trainer = l;
      }
      if (it.time) items.push(it);
    }
    if (day) days.push({ day: day.trim(), date: date.trim(), items });
  }
  return days;
}

export async function onRequestGet(ctx) {
  const cache = caches.default;
  const key = new Request(new URL('/api/program', ctx.request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;
  let body, status = 200;
  try {
    const r = await fetch(SRC, { headers: { 'User-Agent': 'NinjaSportWebsite/1.0' } });
    if (!r.ok) throw new Error('upstream ' + r.status);
    body = JSON.stringify({ updated: new Date().toISOString(), days: parse(await r.text()) });
  } catch (e) { body = JSON.stringify({ error: 'unavailable', days: [] }); status = 502; }
  const res = new Response(body, { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=600' } });
  if (status === 200) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
