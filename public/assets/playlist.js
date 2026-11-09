(function () {
  document.querySelectorAll('[data-pl]').forEach(function (b) {
    var el = b.querySelector('textarea'), msg = b.querySelector('.pl-msg');
    function say(t) { msg.textContent = t; setTimeout(function () { msg.textContent = ''; }, 3000); }
    b.querySelector('[data-copy]').addEventListener('click', function () {
      (navigator.clipboard ? navigator.clipboard.writeText(el.value) : Promise.reject()).then(function () { say('Copiat ✓'); }, function () { el.select(); document.execCommand('copy'); say('Copiat ✓'); });
    });
    var dl = b.querySelector('[data-dl]');
    dl.addEventListener('click', function () {
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([el.value], { type: 'text/plain' }));
      a.download = dl.getAttribute('data-dl') + '.txt'; a.click();
    });
  });
})();
