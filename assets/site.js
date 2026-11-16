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
  /* the reduced-motion preference is followed live: it can change while the page is open (or while it sits
     in the back/forward cache); syncMotion() below brings every effect into line when it does */
  var motionQuery = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reducedMotion = !!(motionQuery && motionQuery.matches);
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
     HOME HERO: one pinned screen, two phases (markup in index.html, look in site.css).
     At rest the visitor drags the line between her photograph and her drawing (.zh-stage, --x).
     Phase one (first HERO_PHASE of the scroll): the line glides from where the visitor left it to 0,
     so only the drawing is left; the photograph, labels and hint fade.
     Phase two: the drawing (.zh-ink, the one and only drawing element) grows to its old end size
     and moves to the centre; the captions .zh-say[data-from][data-to] show between those fractions
     of phase two. Scrolling back reverses it and gives the line back to the visitor.
     Reduced motion: no scroll animation, the split still works.
     ===================================================================== */
  var HERO_END_SCALE = 4.4, HERO_PHASE = 60 / 320;      /* must match .zh height in site.css: 60vh of 320vh */
  function initHero() {
    var h = $('.zh'), stage = h && $('.zh-stage', h);
    if (!stage) return null;
    var ink = $('.zh-ink', h), line = $('.zh-line', h), open = $('.zh-open', h), go = $('.zh-go', h),
      says = $$('.zh-say', h), plate = $('.zh-plate', h), photo = $('.zh-photo', h), paper = $('.zh-paper', h), hint = $('.zh-hint', h),
      soft = [$('.zh-labels', h), $('.zh-cap', h), hint, line].filter(Boolean),
      bar = SK.heroSizeConfirmed ? $('.scalebar', h) : null, mm = +h.dataset.mm || 210;
    var plateLink = plate && $('a', plate);
    if (SK.heroSizeConfirmed) h.setAttribute('data-size-confirmed', '');
    var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var userX = 50, nudge = 0, shown = userX, phaseOne = 0, drag = null, touched = false, ticking = false;

    /* the handle: a real slider */
    var handle = document.createElement('span');
    handle.className = 'zh-handle'; handle.tabIndex = 0; handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', 'Move between the photograph and the drawing. Use the arrow keys.');
    handle.setAttribute('aria-valuemin', '0'); handle.setAttribute('aria-valuemax', '100');
    if (hint) { hint.id = hint.id || 'zh-hint'; handle.setAttribute('aria-describedby', hint.id); }
    line.removeAttribute('aria-hidden'); line.appendChild(handle);

    function setUser(v) { userX = clamp(v, 0, 100); touched = true; nudge = 0; queue(); }
    function at(e) { var r = stage.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; }
    stage.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || phaseOne > 0.02) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, live: e.pointerType === 'mouse' || e.target === handle };
      if (drag.live) { e.preventDefault(); try { stage.setPointerCapture(e.pointerId); } catch (_) {} h.classList.add('dragging'); setUser(at(e)); }
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.live) {          /* touch: only a mostly sideways move takes the line; a vertical one stays a scroll */
        var dx = Math.abs(e.clientX - drag.x0), dy = Math.abs(e.clientY - drag.y0);
        if (dx > 8 && dx > dy) { drag.live = true; try { stage.setPointerCapture(e.pointerId); } catch (_) {} h.classList.add('dragging'); } else return;
      }
      setUser(at(e));
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.live && e.type === 'pointerup' && Math.abs(e.clientX - drag.x0) < 8 && Math.abs(e.clientY - drag.y0) < 8) setUser(at(e));
      drag = null; h.classList.remove('dragging');
    }
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', function (e) {
      var k = e.key, step = e.shiftKey ? 10 : 2, v = userX;
      if (k === 'ArrowRight' || k === 'ArrowUp') v += step; else if (k === 'ArrowLeft' || k === 'ArrowDown') v -= step;
      else if (k === 'PageUp') v += 10; else if (k === 'PageDown') v -= 10; else if (k === 'Home') v = 0; else if (k === 'End') v = 100; else return;
      e.preventDefault(); setUser(v);
    });

    function frame() {
      ticking = false;
      /* read … */
      var vh = window.innerHeight, vw = document.documentElement.clientWidth, r = h.getBoundingClientRect(),
        sr = stage.getBoundingClientRect(), iw = ink.offsetWidth, ih = ink.offsetHeight, hb = hint ? hint.getBoundingClientRect().bottom : vh, gt = go ? go.getBoundingClientRect().top : vh,
        p = reducedMotion ? 0 : clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
      var a = clamp(p / HERO_PHASE, 0, 1), b = clamp((p - HERO_PHASE) / (1 - HERO_PHASE), 0, 1), ea = ease(a);
      phaseOne = a;
      shown = clamp(userX + nudge, 0, 100) * (1 - ea);
      /* … then write */
      stage.style.setProperty('--x', shown + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(shown)));
      handle.setAttribute('aria-valuetext', Math.round(100 - shown) + '% drawing');
      if (reducedMotion) { still(); return; }
      var fade = Math.max(0, 1 - a * 1.6), u = ease(clamp((a - .6) / .4, 0, 1));   /* u: the end of phase one, where the drawing is freed */
      soft.forEach(function (n) { n.style.opacity = fade; });
      stage.style.setProperty('--fade', fade);
      if (photo) photo.style.opacity = Math.max(0, 1 - a * 2);
      if (paper) paper.style.opacity = b > 0 ? 0 : 1;
      line.style.visibility = fade > 0 ? '' : 'hidden';
      if (open) open.style.opacity = Math.max(0, 1 - a * 1.3);
      /* "Scroll to go in": at rest too, faintly, where there is room under the hint; it fades as scrolling starts */
      /* at rest only where it clears the hint by 16px; the caption and hint sit above the hint's bottom edge */
      if (go) go.style.opacity = (a < .02 && gt - hb >= 16) ? .6 : clamp((a - .6) / .3, 0, 1) * Math.max(0, 1 - b * 10);
      /* phase two: grow from the split size to the old end size, moving the zoom point to the centre */
      /* the whole sheet is wider than the square: on narrow screens it is eased down to fit, and centred sideways, before the zoom */
      var fit = Math.min(1, (vw - 16) / Math.max(1, iw)), s0 = 1 + (fit - 1) * u,
        endScale = Math.max(1.01, HERO_END_SCALE * Math.min(vh, vw) * .74 / Math.max(1, iw)),
        s = s0 * Math.pow(endScale / s0, b), k = 1 - u, m = ease(clamp(b / .35, 0, 1)),
        ox = sr.left + (-.23788 + .46 * 1.31747) * sr.width, oy = sr.top - .17567 * sr.width + .5 * ih,
        tx = (vw / 2 - ox) * Math.max(u, m), ty = (vh / 2 - oy) * m;
      if (b > 0 && !ink.dataset.sharp) {                                     /* zooming: fetch the largest file (the WebP source too) */
        ink.dataset.sharp = '1';
        var big = Math.round(iw * endScale) + 'px', source = ink.parentNode && ink.parentNode.tagName === 'PICTURE' && ink.parentNode.querySelector('source');
        if (source) source.sizes = big;
        ink.sizes = big;
      }
      ink.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
      ink.style.clipPath = 'inset(' + (13.333 * k).toFixed(3) + '% ' + (6.042 * k).toFixed(3) + '% ' + (10.833 * k).toFixed(3) + '% ' + ((18.056 + shown * .75903) * k).toFixed(3) + '%)';
      says.forEach(function (n) { n.style.opacity = clamp(Math.min((b - +n.dataset.from) / 0.04, (+n.dataset.to - b) / 0.04), 0, 1); });
      if (plate) {
        var po = clamp(b * 8, 0, 1) * Math.max(0, 1 - Math.max(0, b - 0.45) * 5);
        plate.style.opacity = po;
        if (plateLink) plateLink.tabIndex = po > .5 ? 0 : -1;      /* never a tab stop while it cannot be seen */
      }
      if (bar) setScaleBar(bar, iw * s / mm);
    }
    function still() {
      if (plateLink) plateLink.removeAttribute('tabindex');
      [ink, photo, paper, line, open, go, plate].concat(soft, says).forEach(function (n) {
        if (n) { n.style.opacity = ''; n.style.visibility = ''; }
      });
      ink.style.transform = ''; ink.style.clipPath = ''; stage.style.removeProperty('--fade');
    }
    function queue() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener('scroll', queue, { passive: true });

    /* once both pictures have loaded: one small, slow nudge of the line, so it reads as something that moves */
    if (!reducedMotion) {
      var imgs = [ink, photo && $('img', photo)].filter(Boolean);
      Promise.all(imgs.map(function (im) { return im.complete ? 0 : new Promise(function (res) { im.addEventListener('load', res); im.addEventListener('error', res); }); }))
        .then(function () {
          setTimeout(function () {
            if (touched || window.scrollY > 40) return;
            var t0 = 0, D = 1800;
            requestAnimationFrame(function f(t) {
              if (touched) { nudge = 0; queue(); return; }
              if (!t0) t0 = t;
              var q = Math.min(1, (t - t0) / D);
              nudge = 7 * Math.sin(Math.PI * ease(q)); queue();
              if (q < 1) requestAnimationFrame(f); else { nudge = 0; queue(); }
            });
          }, 700);
        });
    }
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

  /* ---------- reduced motion changed (or the page came back from the cache): settle every effect ---------- */
  function syncMotion() {
    var now = !!(motionQuery && motionQuery.matches);
    if (now === reducedMotion) return;
    reducedMotion = now;
    if (reducedMotion) $$('.rv').forEach(function (n) { n.classList.add('in'); });   /* no fades left pending */
    $$('.zoom.anim').forEach(function (z) { z.classList.remove('anim'); });
    relayout();                                                                     /* hero: still form or moving form */
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
  window.addEventListener('pageshow', function (e) { syncMotion(); if (e.persisted) relayout(); });
  if (motionQuery) { if (motionQuery.addEventListener) motionQuery.addEventListener('change', syncMotion); else if (motionQuery.addListener) motionQuery.addListener(syncMotion); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  relayout();
})();
