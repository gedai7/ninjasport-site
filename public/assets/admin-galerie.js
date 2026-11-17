(function () {
  var REPO = 'gedai7/ninjasport-site', PATH = 'data/gallery.json', API = 'https://api.github.com/repos/' + REPO + '/contents/' + PATH;
  var $ = function (s) { return document.querySelector(s); };
  var tokIn = $('#ag-token'), msg = $('#ag-msg'), tabs = $('#ag-tabs'), grid = $('#ag-grid'), saveBtn = $('#ag-save');
  var data = null, sha = null, cur = 0, dirty = false, sortable = null;
  function say(t, err) { msg.textContent = t; msg.className = 'ag-msg' + (err ? ' err' : ''); }
  function tok() { return tokIn.value.trim(); }
  try { tokIn.value = localStorage.getItem('ag_token') || ''; } catch (e) {}
  function dec(b64) { var bin = atob(b64.replace(/\n/g, '')), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); }
  function enc(str) { var u = new TextEncoder().encode(str), s = ''; for (var i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(s); }
  function thumb(it) { return it.type === 'youtube' ? 'https://i.ytimg.com/vi/' + it.id + '/hqdefault.jpg' : (it.thumb || it.src || ''); }
  function load() {
    if (!tok()) { say('Lipește cheia GitHub mai sus și apasă „Conectează”.', true); return; }
    try { localStorage.setItem('ag_token', tok()); } catch (e) {}
    say('Se încarcă…');
    fetch(API + '?ref=main&t=' + Date.now(), { headers: { Authorization: 'Bearer ' + tok(), Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status === 401 ? 'Cheie greșită sau expirată' : 'Eroare ' + r.status); return r.json(); })
      .then(function (j) { sha = j.sha; data = JSON.parse(dec(j.content)); dirty = false; document.querySelector('.ag-key').open = false; renderTabs(); render(); say('Conectat. Trage pozele ca să le schimbi ordinea, apoi apasă „Salvează”.'); })
      .catch(function (e) { say(e.message, true); });
  }
  function renderTabs() {
    tabs.innerHTML = '';
    data.forEach(function (a, i) { var b = document.createElement('button'); b.type = 'button'; b.textContent = a.title + ' (' + a.items.length + ')'; if (i === cur) b.className = 'on';
      b.onclick = function () { cur = i; renderTabs(); render(); }; tabs.appendChild(b); });
  }
  function render() {
    var a = data[cur]; grid.innerHTML = '';
    a.items.forEach(function (it, i) {
      var li = document.createElement('li'); li.dataset.i = i;
      li.innerHTML = '<span class="n">' + (i + 1) + '</span><img src="' + thumb(it) + '" alt="" loading="lazy" draggable="false">' + (it.type !== 'image' ? '<span class="v">▶</span>' : '') + '<button type="button" class="del" title="Scoate din album">×</button>';
      li.querySelector('.del').onclick = function () { if (!confirm('Scoți această poză din album?')) return; a.items.splice(+li.dataset.i, 1); dirty = true; renderTabs(); render(); say('Poză scoasă – apasă „Salvează”.'); };
      grid.appendChild(li);
    });
    if (sortable) sortable.destroy();
    sortable = Sortable.create(grid, { animation: 150, delay: 250, delayOnTouchOnly: true, touchStartThreshold: 6, ghostClass: 'ghost', filter: '.del', preventOnFilter: false,
      onEnd: function () { var order = [].map.call(grid.children, function (li) { return a.items[+li.dataset.i]; }); a.items = order; dirty = true; render(); say('Ordine schimbată – apasă „Salvează”.'); } });
  }
  function save() {
    if (!data) return; say('Se salvează…'); saveBtn.disabled = true;
    fetch(API, { method: 'PUT', headers: { Authorization: 'Bearer ' + tok(), Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Galerie: ordine actualizată din panoul vizual (' + data[cur].title + ')', content: enc(JSON.stringify(data, null, 2) + '\n'), sha: sha, branch: 'main' }) })
      .then(function (r) { if (r.status === 409) throw new Error('Galeria a fost modificată între timp. Apasă „Conectează” ca s-o reîncarci.'); if (!r.ok) throw new Error('Eroare la salvare (' + r.status + ')'); return r.json(); })
      .then(function (j) { sha = j.content.sha; dirty = false; say('Salvat ✓ – apare pe sait în 1–2 minute.'); })
      .catch(function (e) { say(e.message, true); }).then(function () { saveBtn.disabled = false; });
  }
  $('#ag-connect').onclick = load; saveBtn.onclick = save;
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  var keyBox = document.querySelector('.ag-key');
  if (tok()) load(); else keyBox.open = true;
})();
