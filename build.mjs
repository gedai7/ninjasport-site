// Generează site-ul static în dist/ din data/*.json și content/*.html.
// Rulare: node build.mjs   (fără dependențe)
import fs from 'node:fs';
import path from 'node:path';

const R = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const site = R('data/site.json'), prices = R('data/prices.json'), sched = R('data/schedule.json');
const coaches = R('data/coaches.json'), events = R('data/events.json'), gallery = R('data/gallery.json');
const content = (f) => fs.readFileSync(path.join('content', f), 'utf8');
const OUT = 'dist';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Imagini: dacă fișierul a fost importat local în public/media, folosim copia locală.
const MEDIA_PREFIX = 'https://ninjasport.ro/wp-content/uploads/';
function media(url) {
  if (!url || !url.startsWith(MEDIA_PREFIX)) return url;
  const rel = url.slice(MEDIA_PREFIX.length);
  return fs.existsSync(path.join('public/media', rel)) ? '/media/' + rel : url;
}

const ICON = {
  facebook: '<svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24"><path d="M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm6-7.9a1.1 1.1 0 1 1-1.1-1.1A1.1 1.1 0 0 1 18 7.1zM21.9 7a5.4 5.4 0 0 0-1.5-3.9A5.4 5.4 0 0 0 16.5 1.6C15 1.5 9 1.5 7.5 1.6a5.4 5.4 0 0 0-3.9 1.5A5.4 5.4 0 0 0 2.1 7c-.1 1.5-.1 7.5 0 9a5.4 5.4 0 0 0 1.5 3.9 5.4 5.4 0 0 0 3.9 1.5c1.5.1 7.5.1 9 0a5.4 5.4 0 0 0 3.9-1.5 5.4 5.4 0 0 0 1.5-3.9c.1-1.5.1-7.5 0-9zm-2.3 11a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.9.4s-4.7.1-5.9-.4A3 3 0 0 1 4.4 18c-.5-1.2-.4-4-.4-5.9s-.1-4.7.4-5.9A3 3 0 0 1 6.1 4.4c1.2-.5 4-.4 5.9-.4s4.7-.1 5.9.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 5.9s.1 4.7-.4 5.9z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24"><path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 1 1-2-2.7V9.2a6.3 6.3 0 1 0 5.4 6.2V8.6a8.2 8.2 0 0 0 4.8 1.5V6.7z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1a16 16 0 0 1-1.6-.6 12.8 12.8 0 0 1-4.9-4.3 5.6 5.6 0 0 1-1.2-3 3.2 3.2 0 0 1 1-2.4 1 1 0 0 1 .8-.3h.5c.2 0 .4 0 .6.5l.9 2.1a.5.5 0 0 1 0 .5 2 2 0 0 1-.3.5l-.4.5c-.2.1-.3.3-.1.6a9.4 9.4 0 0 0 1.7 2.1 8.3 8.3 0 0 0 2.5 1.5c.3.2.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 .9c.3.2.5.2.5.4a2.4 2.4 0 0 1-.2 1.4z"/></svg>',
};

// Titluri centrate: învelim conținutul fiecărui h1.page-title / h2 într-un span, ca liniuțele din CSS să stea stânga-dreapta.
const wrapTitles = (html) => html.replace(/<(h1|h2)([^>]*)>([\s\S]*?)<\/\1>/g, (m, t, a, inner) => inner.includes('class="tt"') ? m : `<${t}${a}><span class="tt">${inner}</span></${t}>`);

function layout({ title, active, body, desc = '', scripts = [] }) {
  body = wrapTitles(body);
  const nav = site.nav.map(([t, h]) => `<a href="${h}"${h === active ? ' class="on" aria-current="page"' : ''}>${esc(t)}</a>`).join('');
  const soc = Object.entries(site.social).map(([k, u]) => `<a href="${u}" target="_blank" rel="noopener" aria-label="${k}">${ICON[k] || ''}</a>`).join('');
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title ? title + ' – ' + site.name : site.name + ' – ' + site.tagline)}</title>
<meta name="description" content="${esc(desc || 'Ninja Sport – sală de sporturi cu obstacole, Splaiul Unirii 160, București.')}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="/assets/favicon-48.png" sizes="48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#000000">
<link rel="preload" href="/assets/fonts/Play-Bold.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<header class="site-head"><div class="wrap">
  <div class="head-top"><a class="logo" href="/"><img src="${media(site.logo)}" alt="${esc(site.name)}" width="156" height="64"></a><div class="head-social">${soc}</div></div>
  <nav class="nav" aria-label="Meniu principal">${nav}</nav>
</div></header>
<main><div class="wrap">
${body}
</div></main>
<footer class="site-foot"><div class="wrap">
  <div class="foot-grid">
    <div><h4>Ninja Sport</h4><p>Sală de sporturi cu obstacole</p><p>Asociația Club Sportiv Ninja Sport</p></div>
    <div><h4>Contact</h4><p>${esc(site.address)}</p><p><a href="${site.phone_href}">${esc(site.phone)}</a></p><p><a href="mailto:${site.email}">${esc(site.email)}</a></p></div>
    <div><h4>Social</h4><div class="head-social">${soc}</div></div>
  </div>
  <p class="copy">© ${new Date().getFullYear()} ACS Ninja Sport</p>
</div></footer>
<a class="float-wa" href="${site.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON.whatsapp}</a>
${scripts.map((s) => `<script src="${s}" defer></script>`).join('\n')}
</body>
</html>`;
}

const title2 = (ro, en, tag = 'h1') => `<${tag} class="page-title">${esc(ro)}<span class="en">${esc(en)}</span></${tag}>`;

/* ---------- pagini ---------- */
function pricesHTML() {
  return `<div class="pret">` + prices.sections.map((s) => `
<div class="sec"><div class="sec-h"><span><b>${esc(s.title)}</b><span class="en">${esc(s.ro)}</span></span><span class="p"><b>Contribuție</b><span class="en">Price</span></span></div>
<table><tbody>${s.rows.map((r) => r ? `<tr><td class="n">${esc(r[0])}</td><td class="d">${esc(r[1])}</td><td class="v">${r[2]}<small>lei</small></td></tr>` : '<tr class="gap"><td colspan="3"></td></tr>').join('')}</tbody></table></div>`).join('') + `</div>`;
}

function scheduleHTML() {
  const toSlot = (t) => { const [h, m] = t.split(':').map(Number); return (h - 11) * 2 + (m >= 30 ? 1 : 0); };
  const N = sched.slots.length * 2, grid = Array.from({ length: N }, () => Array(7).fill(null));
  for (const e of sched.events) {
    const s = toSlot(e.from), span = toSlot(e.to) - s;
    grid[s][e.day] = { e, span }; for (let k = s + 1; k < s + span; k++) grid[k][e.day] = 'x';
  }
  let rows = '';
  for (let i = 0; i < N; i++) {
    rows += '<tr>' + (i % 2 === 0 ? `<th rowspan="2">${sched.slots[i / 2].label}</th>` : '');
    for (let d = 0; d < 7; d++) {
      const g = grid[i][d]; if (g === 'x') continue;
      rows += g ? `<td class="ev" rowspan="${g.span}">${esc(g.e.name)}<small>${esc(g.e.party ? g.e.sub : g.e.sub)}</small></td>` : '<td></td>';
    }
    rows += '</tr>';
  }
  const head = sched.days.map(([ro, en]) => `<th><div class="btnd">${ro}<span class="en">${en}</span></div></th>`).join('');
  const cards = sched.days.map(([ro, en], d) => {
    const evs = sched.events.filter((e) => e.day === d);
    return `<div class="day"><h3>${ro}<span class="en">${en}</span></h3><ul>${evs.map((e) => `<li><span class="t">${e.time}</span><span>${esc(e.name)}<small>${esc(e.party ? 'Booking required' : e.sub)}</small></span></li>`).join('')}</ul></div>`;
  }).join('');
  const notes = ['ro', 'en'].map((l) => `<div><div class="lang">${l.toUpperCase()}</div>${sched.notes[l].map(([k, t]) => `<p>${k ? `<span class="k">${k}</span> – ` : ''}${t}</p>`).join('')}</div>`).join('');
  return `<div class="orar"><div class="tw"><table><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></div><div class="cards">${cards}</div></div><div class="notes">${notes}</div>`;
}

const pages = {};

pages['index.html'] = layout({
  title: '', active: '/', body: `
</div><section class="hero" style="--hero:url('${media(site.hero_image)}')"><div class="wrap">
  <h1>Sală de sporturi<br>cu <span class="accent">obstacole</span></h1>
  <p>Ninja Sport face parte din familia sporturilor cu obstacole, alături de OCR și Adventure Race. Antrenamente pentru copii, adolescenți și adulți, Open Gym și petreceri aniversare, în Splaiul Unirii 160, București.</p>
  <a class="btn" href="/schedule/">Program</a><a class="btn btn-dark" href="/prices/">Contribuții</a><a class="btn btn-dark" href="/waiver/">Waiver</a>
</div></section><div class="wrap" style="padding-top:28px">
${events.length ? `<section><h2 class="page-title">Urmează<span class="en">Next event</span></h2>${events.map((e) => `<div class="event"><img src="${media(e.image)}" alt="" loading="lazy"><div><div class="date">${e.date.split('-').reverse().join('.')}</div><h3>${esc(e.title)}</h3><p style="font-weight:400">${esc(e.text)}</p>${e.link ? `<a class="btn" href="${e.link}">Înscrie-te</a>` : `<a class="btn" href="${site.phone_href}">Înscrieri: ${esc(site.phone)}</a>`}</div></div>`).join('')}</section>` : ''}
${events.length ? '<div class="sep" aria-hidden="true"><span></span><img src="/assets/sep-head.png" alt="" width="34" height="31"><span></span></div>' : ''}
<section class="quick">
  <a href="/schedule/">Program<span>Clase și Open Gym, live din aplicație</span></a>
  <a href="/prices/">Contribuții<span>Abonamente copii, adulți, privates</span></a>
  <a href="/party/">Party<span>Petreceri aniversare pentru copii și adulți</span></a>
  <a href="/gallery/">Galerie<span>Poze și video de la competiții</span></a>
</section>
<div class="sep" aria-hidden="true"><span></span><img src="/assets/sep-head.png" alt="" width="34" height="31"><span></span></div>
<section class="split"><div class="prose">
  <h2>Ce este Ninja Sport?<span class="en">What is Ninja Sport?</span></h2>
  <p>Ninja Sport este activitatea sportivă cu obstacole derivată din show-ul TV Ninja Warrior și face parte din familia sporturilor cu obstacole, reglementate de <b>FISO</b> – Federația Internațională de Sport cu Obstacole.</p>
  <p>Începând cu 2024, o ramură a Ninja Sport a devenit disciplină în sportul olimpic <b>Pentatlon Modern</b>, alături de scrimă, înot și Laser Run. ACS Ninja Sport a organizat, în parteneriat cu Federația Română de Natație și Pentatlon Modern, prima ediție în noul format (cu obstacole) a Campionatului Național de Pentatlon Modern.</p>
</div><img src="/media/home/ce-este-ninja-sport.jpg" alt="Antrenor Ninja Sport ajutând o fetiță pe obstacole" loading="lazy" class="tall" width="579" height="1024"></section>
<div class="sep" aria-hidden="true"><span></span><img src="/assets/sep-head.png" alt="" width="34" height="31"><span></span></div>
<section class="prose" style="max-width:none">
  <h2>Beneficii<span class="en">Benefits</span></h2>
  <div class="quick">
    <a href="/ninja-kids/">Conștientizare spațială<span>Deplasare sigură și eficientă printre obstacole</span></a>
    <a href="/ninja-kids/">Agilitate<span>Schimbări rapide de direcție, mai puține accidentări</span></a>
    <a href="/ninja-kids/">Echilibru<span>Stabilitate și încredere în mișcare</span></a>
    <a href="/ninja-kids/">Școala căderii<span>Învățăm să cădem în siguranță</span></a>
  </div>
</section>
<section class="photo-strip"><img src="/media/site/traseu-copii-thumb.jpg" alt="Traseu cu obstacole" loading="lazy"><img src="/media/site/bouldering-copii-thumb.jpg" alt="Bouldering" loading="lazy"><img src="/media/site/grup-copii-thumb.jpg" alt="Copii la Ninja Sport" loading="lazy"><img src="/media/site/competitie-halloween-premiere-thumb.jpg" alt="Competiție Ninja Sport" loading="lazy"></section>
<div class="sep" aria-hidden="true"><span></span><img src="/assets/sep-head.png" alt="" width="34" height="31"><span></span></div>
<section><h2 class="page-title">Parteneri<span class="en">Partners</span></h2><div class="partners">
${['2024/04/BOS_Logo_WO-400x193-1.png', '2024/04/Atlas_arena_logo.png', '2024/04/UNAA-sm-e1712915222600.png', '2024/04/frnpm_logo_square.png'].map((p) => `<img src="${media(MEDIA_PREFIX + p)}" alt="Partener" loading="lazy">`).join('')}
</div></section>
<div class="sep" aria-hidden="true"><span></span><img src="/assets/sep-head.png" alt="" width="34" height="31"><span></span></div>
<section><h2 class="page-title">Cum ajungi la Ninja Sport?<span class="en">How to get here</span></h2>
<p style="font-weight:400">${esc(site.address)} · <a href="${site.phone_href}">${esc(site.phone)}</a></p>
<iframe class="map" src="${site.map}" loading="lazy" title="Hartă Ninja Sport"></iframe></section>` });

pages['prices/index.html'] = layout({ title: 'Contribuții', active: '/prices/', desc: 'Contribuții membri Ninja Sport: abonamente copii, adulți, Open Gym, antrenamente private.', body: title2(prices.title, prices.subtitle) + pricesHTML() });

pages['schedule/index.html'] = layout({
  title: 'Program', active: '/schedule/', scripts: ['/assets/live.js'], body: title2(sched.title, sched.subtitle) + `
<div class="tabs"><button class="on" data-t="std">Program standard</button><button data-t="live">Săptămâna aceasta (live)</button></div>
<div data-tab="std">${scheduleHTML()}</div>
<div data-tab="live" hidden><div id="live" data-portal="${site.booking_portal}" data-fallback="${site.gma_schedule}"><p class="live-msg">Se încarcă programul…</p></div></div>` });

pages['party/index.html'] = layout({ title: 'Party', active: '/party/', scripts: ['/assets/party.js'], desc: 'Petreceri aniversare la Ninja Sport: 3 ore de distracție ninja pe obstacole, pachet pentru 15 invitați, rezervare online.', body: title2('Party · Birthday Party · Adult Party', 'Petreceri aniversare la Ninja Sport') + content('party.html').replace('<form class="party-form" id="party-form" novalidate>', `<form class="party-form" id="party-form" novalidate data-key="${esc(site.form_key || '')}">`) });
pages['ninja-kids/index.html'] = layout({ title: 'Ninja Kids', active: '/ninja-kids/', body: title2('Ninja Kids', 'Kids classes & parties') + content('ninja-kids.html') });
pages['scoala-altfel-saptamana-verde/index.html'] = layout({ title: 'Școala Altfel & Săptămâna Verde', active: '/ninja-kids/', body: title2('Școala Altfel & Săptămâna Verde', 'School groups') + content('scoala-altfel.html') });
const CONTRACT = fs.existsSync('public/documente/Contract_Sponsor_NINJA_SPORT_177.docx') ? '/documente/Contract_Sponsor_NINJA_SPORT_177.docx' : 'https://ninjasport.ro/documente/Contract_Sponsor_NINJA_SPORT_177.docx';
pages['sponsorizare/index.html'] = layout({ title: 'Sponsorizare', active: '/sponsorizare/', desc: 'Sponsorizează ACS Ninja Sport cu până la 20% din impozitul pe profit, fără cost pentru firma ta: plată directă sau Formularul 177.', body: title2('Sponsorizează Ninja Sport', 'Fără cost pentru firma ta · Company sponsorship') + content('sponsorizare.html').replaceAll('%%CONTRACT%%', CONTRACT) });
pages['waiver/index.html'] = layout({
  title: 'Waiver', active: '/waiver/', body: content('waiver.html').replace('<!--WAIVER_BUTTON-->',
    site.waiver_form_url ? `<a class="btn" href="${site.waiver_form_url}" target="_blank" rel="noopener">Completează online</a>` : '<span class="btn btn-dark" style="opacity:.6;cursor:default">Formular online – în curând</span>') });

pages['coaches/index.html'] = layout({
  title: 'Antrenori', active: '/coaches/', body: title2('Antrenori', 'Our coaches') + `<div class="coaches">${coaches.map((c) => `
<article class="coach"><img src="${media(c.photo)}" alt="${esc(c.name)}" loading="lazy"><div class="b"><h3>${esc(c.name)}</h3><div class="role">${esc(c.role)}</div><ul>${c.bio.map((b) => `<li>${esc(b)}</li>`).join('')}</ul><p>${esc(c.text)}</p></div></article>`).join('')}</div>` });

pages['gallery/index.html'] = layout({
  title: 'Galerie', active: '/gallery/', scripts: ['/assets/gallery.js'], body: title2('Galerie', 'Gallery') + `<div class="gal">
<div class="gal-filters"><button class="on" data-f="*">Toate</button>${gallery.map((a) => `<button data-f="${a.slug}">${esc(a.title)}</button>`).join('')}</div>
<div class="gal-grid">${gallery.flatMap((a) => a.items.map((it) => {
    const src = it.type === 'youtube' ? `https://www.youtube-nocookie.com/embed/${it.id}?autoplay=1&rel=0` : media(it.src);
    const thumb = it.type === 'youtube' ? `https://i.ytimg.com/vi/${it.id}/hqdefault.jpg` : media(it.thumb || '');
    return `<a class="gal-item" href="${src}" data-album="${a.slug}" data-type="${it.type === 'image' ? 'image' : it.type === 'video' ? 'video' : 'embed'}" data-src="${src}">${thumb ? `<img src="${thumb}" alt="${esc(a.title)}" loading="lazy" decoding="async">` : '<span class="gal-vph">VIDEO</span>'}${it.type !== 'image' ? '<span class="gal-play"></span>' : ''}</a>`;
  })).join('')}</div></div>` });

/* ---------- scriere ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync('public', OUT, { recursive: true });
for (const [f, html] of Object.entries(pages)) { const p = path.join(OUT, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, html); }
// redirecturi pentru adresele vechi WordPress
fs.writeFileSync(path.join(OUT, '_redirects'), ['/team/* /coaches/ 301', '/birthday-party/ /party/ 301', '/programare-ninja-kids-class/ /schedule/ 301', '/category/* / 302'].join('\n') + '\n');
fs.writeFileSync(path.join(OUT, '404.html'), layout({ title: 'Pagina nu există', body: title2('Pagina nu există', 'Page not found') + '<p><a class="btn" href="/">Înapoi la prima pagină</a></p>' }));
console.log('Built', Object.keys(pages).length, 'pages →', OUT);
