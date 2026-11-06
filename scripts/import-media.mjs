// Descarcă imaginile folosite din vechiul site WordPress în public/media/,
// redimensionate pentru web. Rulează o singură dată (GitHub Action „Import media”).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PREFIX = 'https://ninjasport.ro/wp-content/uploads/';
const urls = new Set();
for (const f of fs.readdirSync('data')) {
  const t = fs.readFileSync(path.join('data', f), 'utf8');
  for (const m of t.matchAll(/https:\/\/ninjasport\.ro\/wp-content\/uploads\/[^"'\s)]+/g)) urls.add(m[0]);
}
for (const f of fs.readdirSync('content')) {
  const t = fs.readFileSync(path.join('content', f), 'utf8');
  for (const m of t.matchAll(/https:\/\/ninjasport\.ro\/wp-content\/uploads\/[^"'\s)]+/g)) urls.add(m[0]);
}
for (const m of fs.readFileSync('build.mjs', 'utf8').matchAll(/'(20\d\d\/\d\d\/[^']+\.(?:png|jpe?g))'/g)) urls.add(PREFIX + m[1]);

let ok = 0, skip = 0;
for (const u of urls) {
  const rel = u.slice(PREFIX.length), out = path.join('public/media', rel);
  if (/\.(mov|mp4|m4v)$/i.test(rel)) { skip++; continue; }          // clipurile merg pe YouTube
  if (fs.existsSync(out)) { ok++; continue; }
  const r = await fetch(u);
  if (!r.ok) { console.warn('lipsă', r.status, u); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const isThumb = /-\d+x\d+\.(jpe?g|png)$/i.test(rel) || /\.png$/i.test(rel);
  const img = sharp(buf).rotate();
  if (/\.png$/i.test(rel)) await img.png({ compressionLevel: 9 }).toFile(out);
  else await img.resize({ width: isThumb ? 800 : 1920, height: isThumb ? 800 : 1920, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  ok++; console.log('✓', rel);
}
console.log(`Gata: ${ok} imagini, ${skip} clipuri sărite.`);
