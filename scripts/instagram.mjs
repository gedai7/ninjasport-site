// Preia ultimele postări de pe Instagram (@ninjasport.ro) prin API-ul oficial
// (Instagram API with Instagram Login) și le salvează pe sait:
//   public/media/instagram/<id>.jpg + <id>-thumb.jpg  și  data/instagram.json
// Rulează zilnic din .github/workflows/instagram.yml. Cheia: secretul IG_TOKEN.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const TOKEN = process.env.IG_TOKEN;
const LIMIT = Number(process.env.IG_LIMIT || 60);
const DIR = 'public/media/instagram';
const API = 'https://graph.instagram.com';

if (!TOKEN) { console.log('IG_TOKEN lipsește – sar peste Instagram.'); process.exit(0); }

async function api(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error((j.error && j.error.message) || 'HTTP ' + r.status);
  return j;
}

// 1) postările
const posts = [];
let next = `${API}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=50&access_token=${encodeURIComponent(TOKEN)}`;
while (next && posts.length < LIMIT) {
  const j = await api(next);
  posts.push(...(j.data || []));
  next = j.paging && j.paging.next;
}
console.log('Postări primite:', posts.length);

// 2) imaginile
fs.mkdirSync(DIR, { recursive: true });
const out = [];
for (const p of posts.slice(0, LIMIT)) {
  const video = p.media_type === 'VIDEO';
  const url = video ? p.thumbnail_url : p.media_url;
  if (!url) continue;
  const big = path.join(DIR, p.id + '.jpg'), small = path.join(DIR, p.id + '-thumb.jpg');
  try {
    if (!fs.existsSync(big) || !fs.existsSync(small)) {
      const r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      await sharp(buf).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(big);
      await sharp(buf).rotate().resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 76, mozjpeg: true }).toFile(small);
      console.log('✓', p.id);
    }
    out.push({ id: p.id, date: (p.timestamp || '').slice(0, 10), permalink: p.permalink, video, caption: (p.caption || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      src: '/media/instagram/' + p.id + '.jpg', thumb: '/media/instagram/' + p.id + '-thumb.jpg' });
  } catch (e) { console.warn('✗', p.id, e.message); }
}

// 3) șterge pozele postărilor care nu mai sunt în listă
const keep = new Set(out.flatMap((x) => [x.id + '.jpg', x.id + '-thumb.jpg']));
for (const f of fs.readdirSync(DIR)) if (f.endsWith('.jpg') && !keep.has(f)) { fs.unlinkSync(path.join(DIR, f)); console.log('– șters', f); }

fs.writeFileSync('data/instagram.json', JSON.stringify(out, null, 2) + '\n');
console.log('Salvate:', out.length);

// 4) prelungește cheia (valabilă 60 de zile de la ultima prelungire)
try {
  const j = await api(`${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(TOKEN)}`);
  console.log('Cheia prelungită: încă', Math.round(j.expires_in / 86400), 'zile.');
  if (j.access_token && j.access_token !== TOKEN && process.env.IG_NEW_TOKEN_FILE) fs.writeFileSync(process.env.IG_NEW_TOKEN_FILE, j.access_token);
} catch (e) { console.warn('Nu am putut prelungi cheia:', e.message); }
