(function () {
  var box = document.getElementById('live'); if (!box) return;
  var EN = {'Luni':'Monday','Marți':'Tuesday','Miercuri':'Wednesday','Joi':'Thursday','Vineri':'Friday','Sâmbătă':'Saturday','Duminică':'Sunday'};
  var LUNI = {Ianuarie:1,Februarie:2,Martie:3,Aprilie:4,Mai:5,Iunie:6,Iulie:7,August:8,Septembrie:9,Octombrie:10,Noiembrie:11,Decembrie:12};
  var portal = box.dataset.portal, now = new Date(), today = now.getDate() + '-' + (now.getMonth() + 1);
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  fetch('https://ninjasport-site.gedai7.workers.dev/api/program').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
    if (!d.days || !d.days.length) throw 0;
    box.innerHTML = '<div class="live-grid">' + d.days.map(function (day) {
      var p = day.date.split(' '), isT = p.length === 2 && LUNI[p[1]] && (parseInt(p[0], 10) + '-' + LUNI[p[1]]) === today;
      return '<div class="live-day' + (isT ? ' today' : '') + '"><div class="live-dh">' + esc(day.day) + '<span class="en">' + esc((EN[day.day] || '') + ' · ' + day.date) + '</span></div>' +
        (day.items.length ? day.items.map(function (it) {
          var full = it.cap && it.booked >= it.cap, pct = it.cap ? Math.min(100, Math.round(100 * it.booked / it.cap)) : 0;
          return '<a class="live-c' + (full ? ' full' : '') + '" href="' + portal + '" target="_blank" rel="noopener"><span class="t">' + esc(it.time) + '</span><span class="n">' + esc(it.name) + '</span>' +
            (it.trainer ? '<span class="tr">' + esc(it.trainer) + '</span>' : '') +
            (it.cap ? '<span class="sp">' + (full ? 'COMPLET / FULL' : 'Locuri / Spots: ' + it.booked + '/' + it.cap) + '</span><span class="bar"><i style="width:' + pct + '%"></i></span>' : '') + '</a>';
        }).join('') : '<div class="live-none">Fără clase<span class="en">No classes</span></div>') + '</div>';
    }).join('') + '</div><p class="live-msg">Apasă pe o clasă pentru rezervare în aplicație. · Tap a class to book in the app.</p>';
  }).catch(function () {
    box.innerHTML = '<p class="live-msg">Programul live nu poate fi încărcat acum. <a href="' + box.dataset.fallback + '" target="_blank" rel="noopener">Vezi programul în aplicație</a>.</p>';
  });
  document.querySelectorAll('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      document.querySelectorAll('[data-tab]').forEach(function (p) { p.hidden = p.dataset.tab !== b.dataset.t; });
    });
  });
})();
