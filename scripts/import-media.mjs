// Descarcă imaginile folosite din vechiul site WordPress în public/media/,
// redimensionate pentru web. Rulează o singură dată (GitHub Action „Import media”).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';

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

let ok = 0, skip = 0; const fail = [];
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', Accept: 'image/avif,image/webp,image/*,*/*;q=0.8', Referer: 'https://ninjasport.ro/' };
async function get(u) {
  let last;
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(u, { headers: UA }); if (!r.ok) throw new Error('HTTP ' + r.status); return Buffer.from(await r.arrayBuffer()); }
    catch (e) { last = e; await new Promise((res) => setTimeout(res, 1500 * (i + 1))); }
  }
  throw last;
}
console.log('Imagini de importat:', urls.size);
for (const u of urls) {
  const rel = u.slice(PREFIX.length), out = path.join('public/media', rel);
  if (/\.(mov|mp4|m4v)$/i.test(rel)) {                                // clipuri → MP4 H.264 720p + poster
    const base = path.basename(rel).replace(/\.\w+$/, ''), mp4 = path.join('public/media/video', base + '.mp4'), jpg = mp4.replace(/\.mp4$/, '.jpg');
    if (fs.existsSync(mp4)) { ok++; continue; }
    try {
      fs.mkdirSync('public/media/video', { recursive: true });
      const tmp = path.join('/tmp', base + path.extname(rel)); fs.writeFileSync(tmp, await get(u));
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-vf', "scale='if(gt(iw,ih),-2,720)':'if(gt(iw,ih),720,-2)'", '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', mp4]);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1', '-i', mp4, '-frames:v', '1', '-vf', "scale='min(800,iw)':-2", '-q:v', '4', jpg]);
      ok++; console.log('✓ video', base, (fs.statSync(mp4).size / 1e6).toFixed(1) + 'MB');
    } catch (e) { fail.push(rel + ' → ' + (e.message || e)); console.warn('✗', rel, e.message || e); }
    continue;
  }
  if (fs.existsSync(out)) { ok++; continue; }
  try {
    const buf = await get(u);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const isThumb = /-\d+x\d+\.(jpe?g|png)$/i.test(rel) || /\.png$/i.test(rel);
    const img = sharp(buf).rotate();
    if (/\.png$/i.test(rel)) await img.png({ compressionLevel: 9 }).toFile(out);
    else await img.resize({ width: isThumb ? 800 : 1920, height: isThumb ? 800 : 1920, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
    ok++; console.log('✓', rel);
  } catch (e) { fail.push(rel + ' → ' + (e.message || e)); console.warn('✗', rel, e.message || e); }
}
// documente (ex. contractul de sponsorizare) – copiate ca atare
for (const d of ['Contract_Sponsorizare_NINJA_SPORT_2026.docx']) {
  const out = path.join('public/documente', d);
  if (fs.existsSync(out)) continue;
  try { const b = await get('https://ninjasport.ro/documente/' + d); fs.mkdirSync('public/documente', { recursive: true }); fs.writeFileSync(out, b); console.log('✓', d); }
  catch (e) { console.warn('✗', d, e.message || e); }
}
console.log(`Gata: ${ok} imagini, ${skip} clipuri sărite, ${fail.length} erori.`);
if (fail.length) console.log('Erori:\n' + fail.join('\n'));
if (!ok && fail.length) { console.error('Nicio imagine descărcată – probabil hostingul blochează serverele GitHub.'); process.exit(1); }
