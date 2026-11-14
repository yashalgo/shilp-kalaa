/* Shilp Kalaa · one script for every page. Each part runs only if its markup is on the page. */
(function () {
  var SK = window.SK || { series: [], works: [] };
  var MEDIUM = 'Ink on paper, 0.03 mm pen';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---------- lettering set ---------- */
  var FONTS = {
    type: 'family=DM+Sans:opsz,wght@9..40,300;9..40,400&family=DM+Mono:wght@300;400',
    sharp: 'family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500',
    pen: 'family=Reenie+Beanie', cursive: 'family=La+Belle+Aurore'
  };
  if (SK.lettering && FONTS[SK.lettering]) {
    document.documentElement.dataset.type = SK.lettering;
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + FONTS[SK.lettering] + '&display=swap';
    document.head.appendChild(l);
  }

  /* ---------- true-size scale bar ---------- */
  var NICE = [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1];
  function setBar(bar, pxPerMm) {
    if (!bar || !pxPerMm) return;
    var mm = NICE.find(function (n) { return n * pxPerMm <= 130; }) || 0.1;
    $('i', bar).style.width = (mm * pxPerMm) + 'px';
    $('span', bar).textContent = mm >= 10 ? (mm / 10) + ' cm' : mm + ' mm';
  }

  /* ---------- plate grids (home and work) ---------- */
  function plate(w) {
    var n = SK.works.indexOf(w) + 1;
    return '<figure class="rv"><a href="piece.html?id=' + w.id + '"><div class="frame"><img class="ink" src="images/' + w.img + '" alt="' + esc(w.title) + ', ink drawing" loading="lazy"></div>' +
      '<figcaption><b class="t">' + esc(w.title) + '</b><span class="lab">Pl. ' + pad(n) + ' · ' + w.year + '</span></figcaption></a></figure>';
  }
  $$('[data-plates]').forEach(function (box) {
    var s = SK.series.find(function (x) { return x.id === box.dataset.plates; });
    if (!s) return;
    var all = SK.works.filter(function (w) { return w.series === s.id; });
    var shown = box.dataset.limit ? all.slice(0, +box.dataset.limit) : all;
    box.innerHTML = '<div class="series" id="' + s.id + '"><span class="lab">Series ' + pad(SK.series.indexOf(s) + 1) + '</span><h2 class="t">' + esc(s.title) + '</h2><span class="lab">' + s.years + ' · ' + all.length + (all.length === 1 ? ' plate' : ' plates') + '</span></div>' +
      (s.note ? '<p class="series-note">' + esc(s.note) + '</p>' : '') +
      '<div class="grid">' + shown.map(plate).join('') + '</div>' +
      (shown.length < all.length ? '<p class="more"><a class="line" href="work.html#' + s.id + '">All of ' + esc(s.title) + '</a></p>' : '');
  });
  /* a hand-picked row across all the series: data-pick="id,id,…" with optional data-label, data-title, data-note */
  $$('[data-pick]').forEach(function (box) {
    var shown = box.dataset.pick.split(',').map(function (id) { return SK.works.find(function (w) { return w.id === id.trim(); }); }).filter(Boolean);
    var yrs = SK.works.map(function (w) { return w.year; });
    box.innerHTML = '<div class="series"><span class="lab">' + esc(box.dataset.label || 'Selected') + '</span><h2 class="t">' + esc(box.dataset.title || 'Selected drawings') + '</h2><span class="lab">' + Math.min.apply(null, yrs) + ' – ' + Math.max.apply(null, yrs) + ' · ' + SK.works.length + ' plates in all</span></div>' +
      (box.dataset.note ? '<p class="series-note">' + esc(box.dataset.note) + '</p>' : '') +
      '<div class="grid">' + shown.map(plate).join('') + '</div>' +
      '<p class="more"><a class="line" href="work.html">All the drawings, series by series</a></p>';
  });

  /* ---------- a single artwork ---------- */
  var pieceBox = $('[data-piece]');
  if (pieceBox) {
    var id = new URLSearchParams(location.search).get('id');
    var i = Math.max(0, SK.works.findIndex(function (w) { return w.id === id; }));
    var w = SK.works[i], n = SK.works.length;
    var prev = SK.works[(i + n - 1) % n], next = SK.works[(i + 1) % n];
    var s = SK.series.find(function (x) { return x.id === w.series; }) || { title: '' };
    var roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi'];
    var looks = (w.looks || []).map(function (k, j) { return '<button data-look="' + j + '"><span class="lab">' + roman[j] + '</span>' + esc(k.name) + '</button>'; }).join('');
    document.title = w.title + ' · Shilp Kalaa';
    pieceBox.innerHTML =
      '<div class="a-view"><div class="zoom" tabindex="0" aria-label="' + esc(w.title) + '. Double-click or pinch to zoom, drag to move." data-mm="' + w.mm + '"' + (w.hires ? ' data-hires="images/' + w.hires + '"' : '') + " data-looks='" + JSON.stringify(w.looks || []) + "'>" +
      '<img class="ink" src="images/' + w.img + '" alt="' + esc(w.title) + ', ink drawing"></div>' +
      '<div class="scalebar lab"><i></i><span>1 cm</span></div><p class="hint lab">Come closer · double-click or pinch</p>' +
      '<div class="ctrl"><button data-zoom="out" aria-label="Zoom out">−</button><button data-zoom="in" aria-label="Zoom in">+</button></div></div>' +
      '<aside class="a-data"><div><p class="lab">Pl. ' + pad(i + 1) + '</p><h1 class="t">' + esc(w.title) + '</h1></div>' +
      '<dl><dt class="lab">Series</dt><dd><a href="work.html#' + w.series + '">' + esc(s.title) + '</a></dd><dt class="lab">Year</dt><dd>' + w.year + '</dd><dt class="lab">Medium</dt><dd>' + esc(w.medium || MEDIUM) + '</dd><dt class="lab">Size</dt><dd>' + esc(w.size) + '</dd></dl>' +
      '<div><p class="lab">' + (looks ? 'Close looks' : 'View') + '</p><div class="a-looks">' + looks + '<button data-zoom="reset"><span class="lab">←</span>Step back</button></div></div>' +
      '<div class="a-end"><a class="line" href="commissions.html?about=' + encodeURIComponent(w.title) + '">Ask about this drawing</a>' +
      '<nav class="a-nav lab" aria-label="More drawings"><a href="piece.html?id=' + prev.id + '">← Previous</a><a href="piece.html?id=' + next.id + '">Next →</a></nav></div></aside>';
  }

  /* ---------- zoom viewer ---------- */
  function Zoomer(el) {
    var z = this; z.el = el; z.img = $('img', el); z.root = el.closest('.piece');
    z.mm = +el.dataset.mm || 200; z.looks = JSON.parse(el.dataset.looks || '[]'); z.hires = el.dataset.hires; z.s = 1; z.tx = 0; z.ty = 0;
    z.img.addEventListener('load', function () { z.layout(); });
    var at = function (e) { var r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    var toggle = function (p) { if (z.s > 5.5) z.reset(); else z.zoomAt(p[0], p[1], 2.4, true); };
    el.addEventListener('wheel', function (e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); var p = at(e); z.zoomAt(p[0], p[1], Math.exp(-e.deltaY * 0.012)); }, { passive: false });
    var lastTouch = 0, lastTap = 0, pts = {}, drag = null, pinch = 0, moved = false;
    el.addEventListener('dblclick', function (e) { if (Date.now() - lastTouch > 700) toggle(at(e)); });
    el.addEventListener('pointerdown', function (e) {
      pts[e.pointerId] = { x: e.clientX, y: e.clientY }; moved = false;
      var ids = Object.keys(pts);
      if (ids.length === 2) { pinch = Math.hypot(pts[ids[0]].x - pts[ids[1]].x, pts[ids[0]].y - pts[ids[1]].y); drag = null; }
      else if (z.s > 1.01) { drag = { x: e.clientX, y: e.clientY, tx: z.tx, ty: z.ty }; el.classList.add('dragging'); }
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
    });
    el.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 2 && pinch) {
        var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), r = el.getBoundingClientRect();
        z.zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / pinch); pinch = d; moved = true;
      } else if (drag) {
        if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 6) moved = true;
        z.tx = drag.tx + e.clientX - drag.x; z.ty = drag.ty + e.clientY - drag.y; z.apply();
      }
    });
    function up(e) {
      delete pts[e.pointerId]; pinch = 0; drag = null; el.classList.remove('dragging');
      if (e.pointerType === 'touch' && e.type === 'pointerup') {
        var now = Date.now(); lastTouch = now;
        if (!moved && now - lastTap < 320) { toggle(at(e)); lastTap = 0; } else lastTap = now;
      }
    }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('keydown', function (e) {
      var k = e.key, step = 80;
      if (k === '+' || k === '=') z.zoomAt(z.W / 2, z.H / 2, 1.6, true);
      else if (k === '-' || k === '_') z.zoomAt(z.W / 2, z.H / 2, 1 / 1.6, true);
      else if (k === '0' || k === 'Escape') z.reset();
      else if (k === 'ArrowLeft') { z.tx += step; z.apply(true); }
      else if (k === 'ArrowRight') { z.tx -= step; z.apply(true); }
      else if (k === 'ArrowUp') { z.ty += step; z.apply(true); }
      else if (k === 'ArrowDown') { z.ty -= step; z.apply(true); }
      else return;
      e.preventDefault();
    });
    if (z.root) {
      $$('[data-zoom]', z.root).forEach(function (b) { b.addEventListener('click', function () {
        var k = b.dataset.zoom; if (k === 'reset') z.reset(); else z.zoomAt(z.W / 2, z.H / 2, k === 'in' ? 1.8 : 1 / 1.8, true); }); });
      $$('[data-look]', z.root).forEach(function (b) { b.addEventListener('click', function () { z.look(+b.dataset.look); }); });
    }
  }
  Zoomer.prototype.layout = function () {
    var r = this.el.getBoundingClientRect(); this.W = r.width; this.H = r.height; if (!this.W) return;
    var a = (this.img.naturalWidth || 1) / (this.img.naturalHeight || 1);
    this.bw = Math.min(this.W, this.H * a); this.bh = this.bw / a; this.ox = (this.W - this.bw) / 2; this.oy = (this.H - this.bh) / 2; this.apply();
  };
  Zoomer.prototype.apply = function (anim) {
    var z = this;
    z.s = Math.max(1, Math.min(10, z.s));
    z.tx = Math.min(0, Math.max(z.W * (1 - z.s), z.tx));
    z.ty = Math.min(0, Math.max(z.H * (1 - z.s), z.ty));
    z.el.classList.toggle('anim', !!anim); z.el.classList.toggle('zoomed', z.s > 1.01);
    z.img.style.transform = 'translate(' + z.tx + 'px,' + z.ty + 'px) scale(' + z.s + ')';
    if (z.root) {
      setBar($('.scalebar', z.root), z.bw * z.s / z.mm);
      var hint = $('.hint', z.root); if (hint && z.s > 1.01) hint.style.opacity = 0;
    }
    if (z.hires && z.s > 1.5 && !z.swapped) { z.swapped = true; var big = new Image(); big.onload = function () { z.img.src = z.hires; }; big.src = z.hires; }
  };
  Zoomer.prototype.mark = function (i) { if (this.root) $$('[data-look]', this.root).forEach(function (b) { b.classList.toggle('on', +b.dataset.look === i); }); };
  Zoomer.prototype.zoomAt = function (px, py, f, anim) {
    var s2 = Math.max(1, Math.min(10, this.s * f)), k = s2 / this.s;
    this.tx = px - (px - this.tx) * k; this.ty = py - (py - this.ty) * k; this.s = s2; this.mark(-1); this.apply(anim);
  };
  Zoomer.prototype.look = function (i) {
    var l = this.looks[i]; if (!l) return; this.s = l.s;
    this.tx = this.W / 2 - l.s * (this.ox + l.x * this.bw); this.ty = this.H / 2 - l.s * (this.oy + l.y * this.bh); this.mark(i); this.apply(true);
  };
  Zoomer.prototype.reset = function () { this.s = 1; this.tx = this.ty = 0; this.mark(-1); this.apply(true); };
  var zoomers = $$('.zoom').map(function (el) { return new Zoomer(el); });

  /* ---------- home: scroll-driven zoom into one drawing ---------- */
  var heroes = $$('.zh').map(function (h) { return { h: h, img: $('img', h), hint: $('.zh-hint', h), open: $('.zh-open', h), says: $$('.zh-say', h), bar: $('.scalebar', h), plate: $('.zh-plate', h), mm: +h.dataset.mm || 210 }; });
  function onScroll() {
    heroes.forEach(function (o) {
      var r = o.h.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      var s = 0.16 * Math.pow(4.4 / 0.16, p);
      o.img.style.transform = 'scale(' + s + ')';
      if (o.hint) o.hint.style.opacity = Math.max(0, 1 - p * 7);
      if (o.open) o.open.style.opacity = Math.max(0, 1 - p * 8);
      o.says.forEach(function (n) { n.style.opacity = Math.max(0, Math.min(1, (p - +n.dataset.from) / 0.04, (+n.dataset.to - p) / 0.04)); });
      if (o.plate) o.plate.style.opacity = Math.max(0, 1 - Math.max(0, p - 0.45) * 5);
      setBar(o.bar, o.img.offsetWidth * s / o.mm);
    });
  }
  if (heroes.length) window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12 });
    $$('.rv').forEach(function (n) { io.observe(n); });
  } else $$('.rv').forEach(function (n) { n.classList.add('in'); });

  /* ---------- enquiry form ---------- */
  var form = $('#enquiry');
  if (form) {
    var note = $('.form-note', form), btn = $('button[type=submit]', form);
    var about = new URLSearchParams(location.search).get('about');
    if (about) form.message.value = 'I am writing about the drawing “' + about + '”.\n\n';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.website.value) return;                       /* honeypot: bots fill this, people never see it */
      if (!SK.email) { note.textContent = 'This form is not connected to an inbox yet. Please write through Instagram for now.'; return; }
      btn.disabled = true; note.textContent = 'Sending…';
      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(SK.email), {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: 'Shilp Kalaa enquiry: ' + form.kind.value, name: form.name.value, email: form.email.value, about: form.kind.value, message: form.message.value })
      }).then(function (r) { if (!r.ok) throw 0; form.reset(); note.textContent = 'Thank you. Your note is on its way. She reads everything slowly, and she will write back.'; })
        .catch(function () { note.textContent = 'That did not send. Please try once more, or write through Instagram.'; })
        .then(function () { btn.disabled = false; });
    });
  }

  function relayout() { zoomers.forEach(function (z) { z.layout(); }); onScroll(); }
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  relayout();
})();
