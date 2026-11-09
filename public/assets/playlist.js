(function () {
  var el = document.getElementById('pl-text'); if (!el) return;
  var msg = document.getElementById('pl-msg');
  function say(t) { msg.textContent = t; setTimeout(function () { msg.textContent = ''; }, 3000); }
  document.getElementById('pl-copy').addEventListener('click', function () {
    var t = el.value;
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { say('Lista a fost copiată ✓'); }, function () { el.select(); document.execCommand('copy'); say('Lista a fost copiată ✓'); });
  });
  document.getElementById('pl-dl').addEventListener('click', function () {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([el.value], { type: 'text/plain' }));
    a.download = 'playlist-ninja-sport.txt'; a.click();
  });
})();
