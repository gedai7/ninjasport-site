# ninjasport.ro

Site static pentru Ninja Sport (fără WordPress). Găzduit pe Cloudflare Pages.

## Structură
- `data/*.json` – conținutul care se schimbă des: prețuri, program, antrenori, evenimente, galerie, date de contact, meniu.
- `content/*.html` – textele paginilor (Ninja Kids, Școala Altfel, Sponsorizare, Waiver).
- `public/` – CSS, JS, fonturi, imagini (`public/media`).
- `functions/api/program.js` – programul live din Gym Management App (`/api/program`, cache 10 minute).
- `build.mjs` – generează site-ul în `dist/` (`npm run build`, fără dependențe).

## Cloudflare (Workers)
- Build command: `node build.mjs`
- Deploy command: `npx wrangler deploy` (folosește `wrangler.jsonc`: fișiere statice din `dist/`, plus `worker.js` pentru `/api/program`).

## Imagini
Imaginile sunt încă luate de pe vechiul site. Rulează o dată workflow-ul **Actions → Import media → Run workflow**:
le descarcă, le optimizează în `public/media/`, iar build-ul le folosește automat pe cele locale.
