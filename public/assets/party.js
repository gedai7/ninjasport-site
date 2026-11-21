(function () {
  var f = document.getElementById('party-form'); if (!f) return;
  var KEY = f.dataset.key || '', WA = '40721012130', MAIL = 'ninjasport.ro@gmail.com';
  var SLOTS = { 6: ['12:00–15:00', '15:30–18:30'], 0: ['11:00–14:00', '14:30–17:30'] };
  var msg = f.querySelector('.form-msg'), dIn = f.data, sel = f.interval;
  function iso(x) { return x.getFullYear() + '-' + ('0' + (x.getMonth() + 1)).slice(-2) + '-' + ('0' + x.getDate()).slice(-2); }
  var min = new Date(); min.setDate(min.getDate() + 14);
  var MIN14 = iso(min), TODAY = iso(new Date());
  // EXCEPȚII: date deschise înainte de cele 14 zile (null = intervalele obișnuite ale zilei)
  var EXTRA = { '2026-11-28': ['12:00–15:00'], '2026-11-29': null };
  var extraDates = Object.keys(EXTRA).filter(function (k) { return k > TODAY && k < MIN14; }).sort();
  dIn.min = extraDates.length ? extraDates[0] : MIN14;
  function slots() { var v = dIn.value, s = SLOTS[day()]; if (s && v in EXTRA && extraDates.indexOf(v) > -1 && EXTRA[v]) return EXTRA[v]; return s; }
  function okDate() { return dIn.value >= MIN14 || extraDates.indexOf(dIn.value) > -1; }
  function day() { if (!dIn.value) return null; var p = dIn.value.split('-'); return new Date(+p[0], p[1] - 1, +p[2]).getDay(); }
  dIn.addEventListener('change', function () {
    var s = slots();
    sel.innerHTML = s ? '<option value="">Alege intervalul</option>' + s.map(function (x) { return '<option>' + x + '</option>'; }).join('') : '<option value="">Doar sâmbăta sau duminica</option>';
    say(s ? '' : 'Petrecerile au loc doar sâmbăta și duminica. Te rugăm să alegi altă dată.', !s);
  });
  function say(t, err) { msg.textContent = t; msg.className = 'form-msg' + (err ? ' err' : t ? ' ok' : ''); }
  function data() {
    var o = {}; ['parinte', 'telefon', 'email', 'sarbatorit', 'varsta', 'data', 'interval', 'participanti', 'mesaj'].forEach(function (k) { o[k] = (f[k].value || '').trim(); }); return o;
  }
  function check() {
    var d = data();
    if (!f.checkValidity()) { f.reportValidity(); return null; }
    if (d.interval && slots() && slots().indexOf(d.interval) < 0) { say('Intervalul ales nu mai este disponibil. Te rugăm să alegi altul.', true); return null; }
    if (!SLOTS[day()]) { say('Petrecerile au loc doar sâmbăta și duminica.', true); return null; }
    if (!okDate()) { say('Te rugăm să rezervi cu cel puțin 2 săptămâni înainte. Pentru o dată mai apropiată, sună-ne.', true); return null; }
    if (+d.varsta < 5) { say('Vârsta minimă pentru participanți este 5 ani.', true); return null; }
    if (+d.participanti > 50) { say('Numărul maxim de participanți este 50.', true); return null; }
    return d;
  }
  var ZILE = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
  function text(d) {
    var dt = d.data.split('-').reverse().join('.');
    return 'Rezervare petrecere Ninja Sport\n' +
      'Părinte: ' + d.parinte + '\nTelefon: ' + d.telefon + '\nEmail: ' + d.email +
      '\nSărbătorit: ' + d.sarbatorit + ' (' + d.varsta + ' ani)\nData: ' + ZILE[day()] + ', ' + dt + ', ' + d.interval +
      '\nParticipanți: ' + d.participanti + (d.mesaj ? '\nMesaj: ' + d.mesaj : '');
  }
  function mail(d) {
    var dt = d.data.split('-').reverse().join('.');
    var o = { access_key: KEY, subject: 'Rezervare petrecere – ' + d.sarbatorit + ', ' + dt, from_name: 'Site Ninja Sport', replyto: d.email,
      'Părinte': d.parinte, 'Telefon': d.telefon, 'Email': d.email,
      'Sărbătorit': d.sarbatorit + ' (' + d.varsta + ' ani)',
      'Data': ZILE[day()] + ', ' + dt + ', ' + d.interval,
      'Participanți': d.participanti };
    if (d.mesaj) o['Mesaj'] = d.mesaj;
    return o;
  }
  f.querySelector('[data-wa]').addEventListener('click', function () {
    var d = check(); if (!d) return;
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text(d)), '_blank');
  });
  f.addEventListener('submit', function (e) {
    e.preventDefault(); var d = check(); if (!d) return;
    if (f.botcheck.checked) return;
    if (!KEY) { // fără serviciu de formular configurat: deschidem emailul pre-completat
      location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Rezervare petrecere – ' + d.sarbatorit + ', ' + d.data.split('-').reverse().join('.')) + '&body=' + encodeURIComponent(text(d));
      say('Se deschide emailul cu rezervarea completată. Apasă „Trimite” în aplicația de email.', false); return;
    }
    var btn = f.querySelector('[type=submit]'); btn.disabled = true; say('Se trimite…', false);
    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(mail(d)) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (!j.success) throw 0; f.reset(); sel.innerHTML = '<option value="">Alege întâi data</option>';
        say('Mulțumim! Am primit cererea de rezervare și te contactăm în curând pentru confirmare.', false);
      }).catch(function () { say('Nu s-a putut trimite. Încearcă pe WhatsApp sau sună-ne la 0721.012.130.', true); })
      .finally(function () { btn.disabled = false; });
  });
})();
