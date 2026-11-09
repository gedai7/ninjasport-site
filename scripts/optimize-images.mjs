// Micșorează pozele mari încărcate din panoul de editare (Pages CMS): max 1920px, JPEG calitate 80.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
let n = 0;
for (const f of walk('public/media')) {
  if (!/\.(jpe?g|png|webp)$/i.test(f) || f.includes('/video/')) continue;
  const size = fs.statSync(f).size; if (size < 600_000) continue;
  const img = sharp(f).rotate(); const m = await img.metadata();
  const big = Math.max(m.width || 0, m.height || 0) > 1920;
  if (!big && size < 1_500_000) continue;
  let buf;
  if (/\.png$/i.test(f)) buf = await img.resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9, palette: true }).toBuffer();
  else buf = await img.resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  if (buf.length < size || big) { fs.writeFileSync(f, buf); n++; console.log('✓', f, (size / 1e6).toFixed(1) + 'MB →', (buf.length / 1e6).toFixed(1) + 'MB'); }
}
console.log('Poze optimizate:', n);
