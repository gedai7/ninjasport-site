(function () {
  var root = document.querySelector('.gal'); if (!root) return;
  var items = [].slice.call(root.querySelectorAll('.gal-item'));
  root.querySelectorAll('.gal-filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      root.querySelectorAll('.gal-filters button').forEach(function (x) { x.classList.toggle('on', x === b); });
      var f = b.dataset.f; items.forEach(function (it) { it.hidden = !(f === '*' || it.dataset.album === f); });
    });
  });
  var lb, stage, cnt, cur = 0, list = [];
  function build() {
    lb = document.createElement('div'); lb.className = 'lb'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<div class="cnt"></div><div class="stage"></div><button class="p" aria-label="Anterior">&#8249;</button><button class="n" aria-label="Următor">&#8250;</button><button class="x" aria-label="Închide">&times;</button>';
    document.body.appendChild(lb); stage = lb.querySelector('.stage'); cnt = lb.querySelector('.cnt');
    lb.querySelector('.x').onclick = close; lb.querySelector('.p').onclick = function () { go(-1); }; lb.querySelector('.n').onclick = function () { go(1); };
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === stage) close(); });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); sx = null; });
    document.addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); });
  }
  function show() {
    var it = list[cur], t = it.dataset.type, s = it.dataset.src, el; stage.innerHTML = '';
    if (t === 'image') { el = document.createElement('img'); el.src = s; el.alt = ''; }
    else if (t === 'video') { el = document.createElement('video'); el.controls = true; el.autoplay = true; el.playsInline = true;
      el.onerror = function () { stage.innerHTML = '<div class="msg">Acest video nu poate fi redat în browserul tău.<br><a href="' + s + '" target="_blank" rel="noopener">Deschide video</a></div>'; }; el.src = s; }
    else { el = document.createElement('iframe'); el.src = s; el.allow = 'autoplay; fullscreen'; el.allowFullscreen = true; }
    stage.appendChild(el); cnt.textContent = (cur + 1) + ' / ' + list.length;
  }
  function open(i) { if (!lb) build(); list = items.filter(function (x) { return !x.hidden; }); cur = list.indexOf(items[i]); lb.hidden = false; document.documentElement.style.overflow = 'hidden'; show(); }
  function close() { lb.hidden = true; stage.innerHTML = ''; document.documentElement.style.overflow = ''; }
  function go(d) { cur = (cur + d + list.length) % list.length; show(); }
  items.forEach(function (it, i) { it.addEventListener('click', function (e) { e.preventDefault(); open(i); }); });
})();
