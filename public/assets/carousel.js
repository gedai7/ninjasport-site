(function () {
  document.querySelectorAll('.carousel').forEach(function (c) {
    var t = c.querySelector('.car-track'), timer;
    function step() { var li = t.querySelector('li'); return li ? li.getBoundingClientRect().width + 8 : t.clientWidth; }
    function go(d) {
      var max = t.scrollWidth - t.clientWidth - 2;
      if (d > 0 && t.scrollLeft >= max) t.scrollTo({ left: 0 });
      else if (d < 0 && t.scrollLeft <= 2) t.scrollTo({ left: max });
      else t.scrollBy({ left: d * step() });
    }
    c.querySelector('.prev').onclick = function () { go(-1); restart(); };
    c.querySelector('.next').onclick = function () { go(1); restart(); };
    function restart() { clearInterval(timer); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(function () { go(1); }, 4000); }
    c.addEventListener('mouseenter', function () { clearInterval(timer); });
    c.addEventListener('mouseleave', restart);
    t.addEventListener('touchstart', function () { clearInterval(timer); }, { passive: true });
    restart();
  });
})();
