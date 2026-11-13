// Pagina ascunsă /oferta-scoala-altfel/: calculează restul de plată, trimite pe WhatsApp, printează.
(() => {
  const f = document.getElementById('oferta');
  if (!f) return;
  const rest = document.getElementById('of-rest');
  const avans = document.getElementById('of-avans');
  const fmt = (n) => n.toLocaleString('ro-RO');
  const upd = () => {
    const p = f.querySelector('input[name="Pachet"]:checked');
    const t = p && p.dataset.total ? +p.dataset.total : NaN;
    const a = +avans.value || 0;
    rest.textContent = Number.isFinite(t) ? fmt(Math.max(t - a, 0)) : '–';
  };
  f.addEventListener('input', upd);
  f.addEventListener('change', upd);

  document.getElementById('of-print').addEventListener('click', () => window.print());
  document.getElementById('of-wa').addEventListener('click', () => {
    const lines = ['Ofertă „Școala Altfel” – Ninja Sport', '25 copii, Open Gym, decembrie 2026'];
    const seen = new Set();
    for (const el of f.elements) {
      if (!el.name || seen.has(el.name)) continue;
      let v;
      if (el.type === 'radio') { seen.add(el.name); const c = f.querySelector(`input[name="${el.name}"]:checked`); v = c && c.value; }
      else v = el.value.trim();
      if (v) lines.push(`${el.name}: ${v}`);
    }
    if (rest.textContent !== '–') lines.push(`Rest de plată: ${rest.textContent} lei`);
    window.open('https://wa.me/40721012130?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
})();
