/* Shilp Kalaa · behaviour for every page.
   The HTML is complete without this file (tools/build.js writes it); this only adds behaviour.
   Each part runs only if its markup is on the page:
     header      hide on scroll down, return on scroll up; phone menu (focus trap, Escape)
     lettering   optional alternative typefaces (SK.lettering)
     forward     piece.html?id=… → drawings/<id>.html
     scale bar   only where a size is confirmed
     zoom        drawing viewer: double-click, buttons, Ctrl/⌘+wheel, pinch, drag, keyboard, close looks
     hero        home page scroll-zoom into one drawing, with its captions
     reveal      short fade-in for .rv blocks
   The Write page (commissions.html) behaviour lives in assets/catalogue.js. */
(function () {
  'use strict';
  var SK = window.SK || { series: [], works: [] };
  var reducedMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); };
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  var findWork = function (id) { return SK.works.filter(function (w) { return w.id === id; })[0]; };

  /* ---------- header: hides on the way down, returns on the way up ---------- */
  function initHeader() {
    var root = document.documentElement, lastY = window.scrollY, ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY;
      if (Math.abs(y - lastY) < 6) return;                          /* ignore jitter */
      root.classList.toggle('head-away', y > lastY && y > 120 && !root.classList.contains('menu-open'));
      lastY = y;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    /* keyboard users tabbing into the header always see it */
    var head = $('.head');
    if (head) head.addEventListener('focusin', function () { root.classList.remove('head-away'); });
  }

  /* ---------- phone menu: a full-screen sheet, focus kept inside, Escape closes ---------- */
  function initMenu() {
    var toggle = $('.menu-toggle'), menu = $('#site-menu'), root = document.documentElement;
    if (!toggle || !menu) return;
    function setOpen(open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
      root.classList.toggle('menu-open', open);
      if (open) { root.classList.remove('head-away'); $('a', menu).focus(); }
      else if (returnFocus) toggle.focus();
    }
    var isOpen = function () { return toggle.getAttribute('aria-expanded') === 'true'; };
    toggle.addEventListener('click', function () { setOpen(!isOpen(), true); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false, true); return; }
      if (e.key !== 'Tab') return;
      var stops = [toggle].concat($$('a', menu)), first = stops[0], last = stops[stops.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    /* leaving phone width with the menu open */
    var wide = matchMedia('(min-width: 641px)');
    var onWide = function () { if (wide.matches && isOpen()) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide); else wide.addListener(onWide);
  }

  /* ---------- alternative lettering sets (SK.lettering) ---------- */
  function initLettering() {
    var FONTS = {
      type: 'family=DM+Sans:opsz,wght@9..40,300;9..40,400&family=DM+Mono:wght@300;400',
      sharp: 'family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500',
      pen: 'family=Reenie+Beanie', cursive: 'family=La+Belle+Aurore'
    };
    if (!SK.lettering || !FONTS[SK.lettering]) return;
    document.documentElement.dataset.type = SK.lettering;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?' + FONTS[SK.lettering] + '&display=swap';
    document.head.appendChild(link);
  }

  /* ---------- piece.html?id=canopy → drawings/canopy.html ---------- */
  function initForward() {
    if (!$('[data-forward]')) return;
    var id = new URLSearchParams(location.search).get('id');
    location.replace(id && findWork(id) ? 'drawings/' + id + '.html' : 'work.html');
  }

  /* ---------- scale bar (rendered only for confirmed sizes) ---------- */
  var NICE_MM = [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1];
  function setScaleBar(bar, pxPerMm) {
    if (!bar || !pxPerMm || !isFinite(pxPerMm)) return;
    var mm = NICE_MM.filter(function (n) { return n * pxPerMm <= 130; })[0] || 0.1;
    $('i', bar).style.width = (mm * pxPerMm) + 'px';
    $('span', bar).textContent = mm >= 10 ? (mm / 10) + ' cm' : mm + ' mm';
  }

  /* =====================================================================
     ZOOM VIEWER. Markup (from tools/build.js):
       .piece > .a-view > .zoom[data-looks][data-mm?][data-hires?] > picture > img
       buttons [data-zoom=in|out|reset] and [data-look=n] anywhere inside .piece
     The image fills .zoom with object-fit:contain; we transform it with
     translate(tx,ty) scale(s) from the top-left corner.
     ===================================================================== */
  var MAX_ZOOM = 10;
  function Zoomer(el) {
    this.el = el;
    this.img = $('img', el);
    this.root = el.closest('.piece') || el.parentNode;
    this.mm = +el.dataset.mm || 0;
    this.looks = JSON.parse(el.dataset.looks || '[]');
    this.hires = el.dataset.hires;
    this.s = 1; this.tx = 0; this.ty = 0;
    this.W = 0; this.H = 0;
    this.bindPointer();
    this.bindKeys();
    this.bindButtons();
    var z = this;
    if (!this.img.complete) this.img.addEventListener('load', function () { z.layout(); });
  }

  /* Measure the box and where the drawing sits inside it (object-fit: contain). */
  Zoomer.prototype.layout = function () {
    var r = this.el.getBoundingClientRect();
    if (!r.width) return;
    var oldW = this.W, oldH = this.H;
    this.W = r.width; this.H = r.height;
    var ratio = (this.img.naturalWidth || +this.img.getAttribute('width') || 1) / (this.img.naturalHeight || +this.img.getAttribute('height') || 1);
    this.bw = Math.min(this.W, this.H * ratio); this.bh = this.bw / ratio;
    this.ox = (this.W - this.bw) / 2; this.oy = (this.H - this.bh) / 2;
    /* keep the same point at the centre after a resize or rotation */
    if (oldW && (oldW !== this.W || oldH !== this.H) && this.s > 1) {
      var cx = (oldW / 2 - this.tx) / (this.s * oldW), cy = (oldH / 2 - this.ty) / (this.s * oldH);
      this.tx = this.W / 2 - cx * this.s * this.W; this.ty = this.H / 2 - cy * this.s * this.H;
    }
    this.apply();
  };

  Zoomer.prototype.apply = function (animate) {
    this.s = clamp(this.s, 1, MAX_ZOOM);
    this.tx = clamp(this.tx, this.W * (1 - this.s), 0);
    this.ty = clamp(this.ty, this.H * (1 - this.s), 0);
    this.el.classList.toggle('anim', !!animate && !reducedMotion);
    this.el.classList.toggle('zoomed', this.s > 1.01);
    this.img.style.transform = 'translate(' + this.tx + 'px,' + this.ty + 'px) scale(' + this.s + ')';
    setScaleBar($('.scalebar', this.root), this.mm && this.bw * this.s / this.mm);
    if (this.s > 1.5) this.loadSharper();
  };

  /* Once zoomed, ask for the largest file: a larger `sizes` makes the browser pick the
     biggest srcset candidate; `data-hires` (if a work has one) replaces it outright. */
  Zoomer.prototype.loadSharper = function () {
    if (this.sharper) return;
    this.sharper = true;
    var img = this.img, big = Math.round(this.W * MAX_ZOOM) + 'px';
    $$('source', img.parentNode).forEach(function (s) { s.sizes = big; });
    if (img.srcset) img.sizes = big;
    if (this.hires) {
      var pre = new Image(), hires = this.hires;
      pre.onload = function () { $$('source', img.parentNode).forEach(function (s) { s.remove(); }); img.removeAttribute('srcset'); img.src = hires; };
      pre.src = hires;
    }
  };

  Zoomer.prototype.zoomAt = function (px, py, factor, animate) {
    var s2 = clamp(this.s * factor, 1, MAX_ZOOM), k = s2 / this.s;
    this.tx = px - (px - this.tx) * k;
    this.ty = py - (py - this.ty) * k;
    this.s = s2;
    this.markLook(-1);
    this.apply(animate);
  };
  Zoomer.prototype.zoomCentre = function (factor) { this.zoomAt(this.W / 2, this.H / 2, factor, true); };
  Zoomer.prototype.pan = function (dx, dy) { this.tx += dx; this.ty += dy; this.apply(true); };
  Zoomer.prototype.reset = function () { this.s = 1; this.tx = 0; this.ty = 0; this.markLook(-1); this.apply(true); };

  /* A guided close look: x, y are the centre as 0–1 across the drawing, s the zoom. */
  Zoomer.prototype.look = function (i) {
    var l = this.looks[i];
    if (!l) return;
    this.revealViewer();
    this.s = l.s;
    this.tx = this.W / 2 - l.s * (this.ox + l.x * this.bw);
    this.ty = this.H / 2 - l.s * (this.oy + l.y * this.bh);
    this.markLook(i);
    this.apply(true);
  };
  Zoomer.prototype.markLook = function (i) {
    var look = this.looks[i];
    $$('[data-look]', this.root).forEach(function (b) {
      var on = +b.dataset.look === i;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    $$('.look-note', this.root).forEach(function (p) { p.textContent = look && look.note ? look.note : ''; });
  };
  /* On phones and tablets the viewer may be partly off screen when a look is chosen. */
  Zoomer.prototype.revealViewer = function () {
    var r = this.el.getBoundingClientRect(), headH = 64;
    if (r.top < headH || r.bottom > window.innerHeight) {
      window.scrollBy({ top: r.top - headH - 8, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  Zoomer.prototype.bindPointer = function () {
    var z = this, el = this.el;
    var at = function (e) { var r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    var toggle = function (p) { if (z.s > 5.5) z.reset(); else z.zoomAt(p[0], p[1], 2.4, true); };
    var points = {}, drag = null, pinchDist = 0, moved = false, lastTouchEnd = 0, lastTap = 0;

    /* mouse wheel zooms only with Ctrl/⌘ (trackpad pinch arrives this way too); plain scrolling scrolls the page */
    el.addEventListener('wheel', function (e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      var p = at(e);
      z.zoomAt(p[0], p[1], Math.exp(-e.deltaY * 0.012));
    }, { passive: false });
    el.addEventListener('dblclick', function (e) { if (Date.now() - lastTouchEnd > 700) toggle(at(e)); });

    el.addEventListener('pointerdown', function (e) {
      points[e.pointerId] = { x: e.clientX, y: e.clientY };
      moved = false;
      var ids = Object.keys(points);
      if (ids.length === 2) {
        pinchDist = Math.hypot(points[ids[0]].x - points[ids[1]].x, points[ids[0]].y - points[ids[1]].y);
        drag = null;
      } else if (z.s > 1.01) {
        drag = { x: e.clientX, y: e.clientY, tx: z.tx, ty: z.ty };
        el.classList.add('dragging');
      }
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
    });
    el.addEventListener('pointermove', function (e) {
      if (!points[e.pointerId]) return;
      points[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(points);
      if (ids.length === 2 && pinchDist) {
        var a = points[ids[0]], b = points[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), r = el.getBoundingClientRect();
        z.zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / pinchDist);
        pinchDist = d; moved = true;
      } else if (drag) {
        if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 6) moved = true;
        z.tx = drag.tx + e.clientX - drag.x;
        z.ty = drag.ty + e.clientY - drag.y;
        z.apply();
      }
    });
    function release(e) {
      delete points[e.pointerId];
      pinchDist = 0; drag = null;
      el.classList.remove('dragging');
      /* double-tap on touch screens (dblclick is unreliable there) */
      if (e.pointerType === 'touch' && e.type === 'pointerup') {
        var now = Date.now();
        lastTouchEnd = now;
        if (!moved && now - lastTap < 320) { toggle(at(e)); lastTap = 0; } else lastTap = now;
      }
    }
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
  };

  Zoomer.prototype.bindKeys = function () {
    var z = this, STEP = 80;
    this.el.addEventListener('keydown', function (e) {
      switch (e.key) {
        case '+': case '=': z.zoomCentre(1.6); break;
        case '-': case '_': z.zoomCentre(1 / 1.6); break;
        case '0': case 'Escape': if (z.s === 1) return; z.reset(); break;
        case 'ArrowLeft': if (z.s === 1) return; z.pan(STEP, 0); break;
        case 'ArrowRight': if (z.s === 1) return; z.pan(-STEP, 0); break;
        case 'ArrowUp': if (z.s === 1) return; z.pan(0, STEP); break;
        case 'ArrowDown': if (z.s === 1) return; z.pan(0, -STEP); break;
        default: return;
      }
      e.preventDefault();
    });
  };

  Zoomer.prototype.bindButtons = function () {
    var z = this;
    $$('[data-zoom]', this.root).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.zoom;
        if (k === 'reset') z.reset(); else z.zoomCentre(k === 'in' ? 1.8 : 1 / 1.8);
      });
    });
    $$('[data-look]', this.root).forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { z.look(+b.dataset.look); });
    });
  };

  /* =====================================================================
     HOME HERO: the drawing grows as the visitor scrolls through .zh.
     Starting size: the CSS variable --hero-start on .zh (a length such as 24vh,
     or a plain number = scale). Captions .zh-say[data-from][data-to] show between
     those scroll fractions (0–1).
     ===================================================================== */
  var HERO_END_SCALE = 4.4;
  function initHero() {
    var heroes = $$('.zh').map(function (h) {
      if (SK.heroSizeConfirmed) h.setAttribute('data-size-confirmed', '');
      return { h: h, img: $('img', h), hint: $('.zh-hint', h), open: $('.zh-open', h), says: $$('.zh-say', h),
        bar: SK.heroSizeConfirmed ? $('.scalebar', h) : null, plate: $('.zh-plate', h), mm: +h.dataset.mm || 210 };
    }).filter(function (o) { return o.img; });
    if (!heroes.length || reducedMotion) return null;           /* reduced motion: CSS shows a still, legible hero */

    function startScale(o) {
      var v = getComputedStyle(o.h).getPropertyValue('--hero-start').trim(), base = o.img.offsetHeight || 1;
      if (/vh$/.test(v)) return clamp(parseFloat(v) * window.innerHeight / 100 / base, 0.05, 1);
      if (/px$/.test(v)) return clamp(parseFloat(v) / base, 0.05, 1);
      return parseFloat(v) || 0.16;
    }
    var ticking = false;
    function frame() {
      ticking = false;
      /* read everything first … */
      var vh = window.innerHeight;
      var state = heroes.map(function (o) {
        var r = o.h.getBoundingClientRect();
        return { p: clamp(-r.top / Math.max(1, r.height - vh), 0, 1), s0: startScale(o), w: o.img.offsetWidth };
      });
      /* … then write */
      heroes.forEach(function (o, i) {
        var p = state[i].p, s = state[i].s0 * Math.pow(HERO_END_SCALE / state[i].s0, p);
        o.img.style.transform = 'scale(' + s + ')';
        if (o.hint) o.hint.style.opacity = Math.max(0, 1 - p * 7);
        if (o.open) o.open.style.opacity = Math.max(0, 1 - p * 8);
        o.says.forEach(function (n) { n.style.opacity = clamp(Math.min((p - +n.dataset.from) / 0.04, (+n.dataset.to - p) / 0.04), 0, 1); });
        if (o.plate) o.plate.style.opacity = Math.max(0, 1 - Math.max(0, p - 0.45) * 5);
        if (o.bar) setScaleBar(o.bar, state[i].w * s / o.mm);
      });
    }
    function queue() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener('scroll', queue, { passive: true });
    return queue;
  }

  /* ---------- reveal: a short fade as blocks enter the view (CSS hides .rv only when JS runs) ---------- */
  function initReveal() {
    var blocks = $$('.rv');
    if (reducedMotion || !('IntersectionObserver' in window)) { blocks.forEach(function (n) { n.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    blocks.forEach(function (n) { io.observe(n); });
  }

  /* ---------- start ---------- */
  initForward();
  initLettering();
  initHeader();
  initMenu();
  var zoomers = $$('.zoom').map(function (el) { return new Zoomer(el); });
  var heroFrame = initHero();
  initReveal();

  function relayout() {
    zoomers.forEach(function (z) { z.layout(); });
    if (heroFrame) heroFrame();
  }
  window.addEventListener('resize', relayout);
  window.addEventListener('orientationchange', relayout);
  window.addEventListener('load', relayout);
  /* coming back through the back/forward cache: sizes may have changed while away */
  window.addEventListener('pageshow', function (e) { if (e.persisted) relayout(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  relayout();
})();
