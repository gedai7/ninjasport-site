(function () {
  var f = document.getElementById('party-form'); if (!f) return;
  var KEY = f.dataset.key || '', WA = '40721012130', MAIL = 'ninjasport.ro@gmail.com';
  var SLOTS = { 6: ['12:00–15:00', '15:30–18:30'], 0: ['11:00–14:00', '14:30–17:30'] };
  var msg = f.querySelector('.form-msg'), dIn = f.data, sel = f.interval;
  var min = new Date(); min.setDate(min.getDate() + 14);
  dIn.min = min.toISOString().slice(0, 10);
  function day() { if (!dIn.value) return null; var p = dIn.value.split('-'); return new Date(+p[0], p[1] - 1, +p[2]).getDay(); }
  dIn.addEventListener('change', function () {
    var d = day(), s = SLOTS[d];
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
    if (!SLOTS[day()]) { say('Petrecerile au loc doar sâmbăta și duminica.', true); return null; }
    if (dIn.value < dIn.min) { say('Te rugăm să rezervi cu cel puțin 2 săptămâni înainte. Pentru o dată mai apropiată, sună-ne.', true); return null; }
    if (+d.varsta < 5) { say('Vârsta minimă pentru participanți este 5 ani.', true); return null; }
    if (+d.participanti > 25) { say('Numărul maxim de participanți este 25.', true); return null; }
    return d;
  }
  function text(d) {
    var dt = d.data.split('-').reverse().join('.');
    return 'Rezervare petrecere Ninja Sport\n' +
      'Părinte: ' + d.parinte + '\nTelefon: ' + d.telefon + '\nEmail: ' + d.email +
      '\nSărbătorit: ' + d.sarbatorit + ' (' + d.varsta + ' ani)\nData: ' + dt + ', ' + d.interval +
      '\nParticipanți: ' + d.participanti + (d.mesaj ? '\nMesaj: ' + d.mesaj : '');
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
      body: JSON.stringify(Object.assign({ access_key: KEY, subject: 'Rezervare petrecere – ' + d.sarbatorit + ', ' + d.data.split('-').reverse().join('.'), from_name: 'Site Ninja Sport', replyto: d.email, mesaj_complet: text(d) }, d)) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (!j.success) throw 0; f.reset(); sel.innerHTML = '<option value="">Alege întâi data</option>';
        say('Mulțumim! Am primit cererea de rezervare și te contactăm în curând pentru confirmare.', false);
      }).catch(function () { say('Nu s-a putut trimite. Încearcă pe WhatsApp sau sună-ne la 0721.012.130.', true); })
      .finally(function () { btn.disabled = false; });
  });
})();
