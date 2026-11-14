// Pagina ascunsă /oferta-inchiriere-sala/: interval orar (1–2 ore consecutive), preț și rest de plată calculate automat,
// trimitere pe WhatsApp, print.
(() => {
  const f = document.getElementById('oferta');
  if (!f) return;
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => n.toLocaleString('ro-RO');
  const BASE_KIDS = 15, BASE_PRICE = 150, EXTRA_PRICE = 50;
  const slots = [...$('of-slots').querySelectorAll('input[type=checkbox]')];

  // Interval orar: maximum 2 ore, și doar consecutive.
  slots.forEach((cb) => cb.addEventListener('change', () => {
    if (cb.checked) {
      const on = slots.filter((s) => s.checked && s !== cb);
      let kept = false; // păstrează doar o oră vecină cu cea nou bifată
      on.forEach((s) => { if (!kept && Math.abs(+s.value - +cb.value) === 1) kept = true; else s.checked = false; });

    }
    upd();
  }));
  const interval = () => {
    const on = slots.filter((s) => s.checked).map((s) => +s.value).sort((a, b) => a - b);
    return on.length ? `${on[0]}:00 – ${on[on.length - 1] + 1}:00 (${on.length} ${on.length > 1 ? 'ore' : 'oră'})` : '';
  };

  const total = () => {
    const n = Math.max(+$('of-copii').value || 0, BASE_KIDS);
    const extra = n - BASE_KIDS;
    return { n, extra, sum: BASE_KIDS * BASE_PRICE + extra * EXTRA_PRICE };
  };

  function upd() {
    const { n, extra, sum } = total();
    $('of-n').textContent = n;
    $('of-extra-n').textContent = extra;
    $('of-extra').textContent = fmt(extra * EXTRA_PRICE);
    $('of-total').textContent = fmt(sum);
    $('of-interval').textContent = interval() || '–';
    const altul = f.querySelector('input[name="Pachet"]:checked')?.value === 'Altul';
    const t = altul ? +$('of-altul').value : sum;
    rest = altul && !$('of-altul').value ? null : Math.max(t - (+$('of-avans').value || 0), 0);
    $('of-rest').textContent = rest == null ? '–' : fmt(rest);
  }
  let rest = null;
  f.addEventListener('input', upd);
  f.addEventListener('change', upd);
  $('of-altul').addEventListener('focus', () => { f.querySelector('input[name="Pachet"][value="Altul"]').checked = true; upd(); });
  upd();

  $('of-print').addEventListener('click', () => window.print());
  $('of-wa').addEventListener('click', () => {
    const L = ['Ofertă închiriere sală – Ninja Sport'];
    const v = (name) => { const el = f.elements[name]; return el && el.value && el.value.trim(); };
    const radio = (name) => f.querySelector(`input[name="${name}"]:checked`)?.value;
    for (const k of ['Organizator', 'Persoană de contact', 'Telefon / E-mail', 'Număr copii', 'Tip eveniment']) if (v(k)) L.push(`${k}: ${v(k)}`);
    const data = [v('Ziua'), v('Luna'), v('Anul')].filter(Boolean).join(' ');
    if (data) L.push(`Data: ${data}`);
    if (interval()) L.push(`Interval: ${interval()}`);
    const { n, sum } = total();
    L.push(`Total pachet Standard (${n} copii): ${fmt(sum)} lei`);
    if (radio('Confirmat')) L.push(`Confirmat: ${radio('Confirmat')}`);
    L.push(`Pachet ales: ${radio('Pachet')}${radio('Pachet') === 'Altul' && v('Pachet altul (lei)') ? ` – ${v('Pachet altul (lei)')} lei` : ''}`);
    if (v('Avans (lei)')) L.push(`Avans: ${v('Avans (lei)')} lei`);
    if (rest != null) L.push(`Rest de plată: ${fmt(rest)} lei`);
    if (v('Alte mențiuni')) L.push(`Mențiuni: ${v('Alte mențiuni')}`);
    window.open('https://wa.me/40721012130?text=' + encodeURIComponent(L.join('\n')), '_blank', 'noopener');
  });
})();
