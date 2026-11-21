// Deschide Termenii / Politica într-o fereastră peste pagină (fără să pierzi formularul completat).
(function () {
  var links = document.querySelectorAll('a[data-pop]'); if (!links.length || !window.HTMLDialogElement) return;
  var dlg = document.createElement('dialog'); dlg.className = 'pop';
  dlg.innerHTML = '<div class="pop-head"><b class="pop-t"></b><button type="button" class="pop-x" aria-label="Închide">×</button></div><div class="pop-body prose">Se încarcă…</div><div class="pop-foot"><button type="button" class="btn pop-ok">Am înțeles – înapoi la formular</button></div>';
  document.body.appendChild(dlg);
  var body = dlg.querySelector('.pop-body'), cache = {};
  function close() { dlg.close(); }
  dlg.querySelector('.pop-x').onclick = close; dlg.querySelector('.pop-ok').onclick = close;
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  dlg.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault(); var u = a.getAttribute('href');
      dlg.querySelector('.pop-t').textContent = a.textContent; body.innerHTML = 'Se încarcă…'; body.scrollTop = 0;
      document.documentElement.style.overflow = 'hidden'; dlg.showModal();
      (cache[u] ? Promise.resolve(cache[u]) : fetch(u).then(function (r) { return r.text(); }).then(function (t) {
        var d = new DOMParser().parseFromString(t, 'text/html'), m = d.querySelector('section.legal'); return (cache[u] = m ? m.innerHTML : null);
      })).then(function (h) { if (h) body.innerHTML = h; else location.href = u; }).catch(function () { location.href = u; });
    });
  });
})();
