// Cloudflare Worker: servește site-ul static din dist/ și programul live la /api/program.
import { parse } from './functions/api/program.js';

const SRC = 'https://ninjasport.gym-management-app.com/calendars/schedules';

async function program(request, ctx) {
  const cache = caches.default;
  const key = new Request(new URL('/api/program', request.url).toString());
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/program') return program(request, ctx);
    return env.ASSETS.fetch(request);
  },
};
