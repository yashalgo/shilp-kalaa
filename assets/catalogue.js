/* Shilp Kalaa · behaviour for the catalogue pages (Work, drawing pages, Write).
   The HTML is complete without this file (tools/build.js writes it); this only adds behaviour.
     strip    Work: the sticky series strip marks the series on screen and follows the header
     patch    drawing pages: "Drawing / The patch" lays her field photograph over the drawing
     write    commissions.html: the form (always shown; sends to SK.formTo, or says it is not connected), ?kind= and ?about= */
(function () {
  'use strict';
  var SK = window.SK || { series: [], works: [] };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var findWork = function (id) { return SK.works.filter(function (w) { return w.id === id; })[0]; };
  var thumb = function (w) { return 'images/generated/' + w.img.replace(/\.jpg$/, '') + '-480.jpg'; };

  /* ---------- Work: series strip ---------- */
  /* Skip link: pages with <base href> would resolve "#main" to the home page; move focus here instead. */
  function initSkip() {
    var skip = $('.skip-link'), main = document.getElementById('main');
    if (!skip || !main) return;
    skip.addEventListener('click', function (e) {
      e.preventDefault();
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      main.scrollIntoView();
    });
  }

  function initStrip() {
    var strip = $('.strip');
    if (!strip) return;
    var root = document.documentElement, head = $('.head');
    /* the strip sits under the header while the header is showing, at the very top when it hides */
    function headHeight() { root.style.setProperty('--head-h', (head ? head.offsetHeight : 0) + 'px'); }
    headHeight();
    window.addEventListener('resize', headHeight);
    var links = $$('a', strip), sections = links.map(function (a) { return document.getElementById(a.hash.slice(1)); });
    var current = null;
    function mark(id) {
      if (id === current) return;
      current = id;
      links.forEach(function (a) {
        var on = a.hash === '#' + id;
        if (on) { a.setAttribute('aria-current', 'true'); if (strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: a.offsetLeft - 20, behavior: 'smooth' }); }
        else a.removeAttribute('aria-current');
      });
    }
    function onScroll() {
      /* a section counts as "on screen" once its top passes a line a third of the way down: a jump link
         lands its section just under the strip, which is always above this line */
      var line = Math.max((strip.getBoundingClientRect().bottom || 0) + 40, window.innerHeight * 0.34), id = null;
      sections.forEach(function (s) { if (s && s.getBoundingClientRect().top <= line) id = s.id; });
      var last = sections[sections.length - 1];
      if (last && last.getBoundingClientRect().bottom < line) id = null;      /* past the last series: field photographs */
      mark(id);
    }
    var ticking = false;
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); } }, { passive: true });
    onScroll();
  }

  /* ---------- drawing pages: the patch ---------- */
  function initPatch() {
    var layer = $('.patch'), zoom = $('.zoom');
    if (!layer || !zoom) return;
    var img = $('img', zoom), cap = $('.patch-cap'), buttons = $$('[data-patch]');
    var box = layer.dataset.box.split(',').map(Number);
    /* place the photograph over the area of the drawing it was registered to */
    function place() {
      var r = zoom.getBoundingClientRect(), v = zoom.offsetParent ? zoom : zoom;
      var ratio = (img.naturalWidth || +img.getAttribute('width')) / (img.naturalHeight || +img.getAttribute('height'));
      var bw = Math.min(r.width, r.height * ratio), bh = bw / ratio;
      var ox = (r.width - bw) / 2 + zoom.offsetLeft, oy = (r.height - bh) / 2 + zoom.offsetTop;
      layer.style.left = (ox + box[0] * bw) + 'px';
      layer.style.top = (oy + box[1] * bh) + 'px';
      layer.style.width = (box[2] * bw) + 'px';
      layer.style.height = (box[3] * bh) + 'px';
      return v;
    }
    function set(on) {
      if (on) { var reset = $('[data-zoom="reset"]'); if (reset) reset.click(); place(); }
      layer.hidden = !on; if (cap) cap.hidden = !on;
      requestAnimationFrame(function () { layer.classList.toggle('on', on); });
      document.documentElement.classList.toggle('patch-on', on);
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String((b.dataset.patch === 'on') === on)); });
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.patch === 'on'); }); });
    /* any zoom or look goes back to the drawing */
    $$('[data-look],[data-zoom="in"],[data-zoom="out"]').forEach(function (b) { b.addEventListener('click', function () { if (!layer.hidden) set(false); }); });
    zoom.addEventListener('dblclick', function () { if (!layer.hidden) set(false); });
    window.addEventListener('resize', function () { if (!layer.hidden) place(); });
  }

  /* ---------- Write page ---------- */
  var PLACEHOLDER = {
    commission: 'The place, where it is, and why it matters to you. Any size or date you have in mind.',
    existing: 'Which drawing, and what you have in mind: an exhibition, a loan, something similar.',
    exhibition: 'The venue or event, the dates, and what you are imagining.',
    collaboration: 'What you would like to make together, and where.',
    other: 'Tell her about it.'
  };
  var MESSAGES = {
    name: 'Please add your name.',
    email: 'Please add an email address she can reply to.',
    emailBad: 'That email address looks incomplete.',
    message: 'Please write a few words about what you have in mind.'
  };
  function initWrite() {
    var page = $('.wr');
    if (!page) return;
    var params = new URLSearchParams(location.search);
    var work = findWork(params.get('about') || '');
    var kind = params.get('kind') || (work ? 'existing' : '');
    if (!PLACEHOLDER[kind]) kind = work ? 'existing' : '';

    /* the path that matches what the visitor is writing about comes forward ('' = none) */
    function choosePath(k) {
      var chosen = false;
      $$('.path').forEach(function (p) { var on = !!k && p.dataset.kinds.split(' ').indexOf(k) >= 0; p.classList.toggle('chosen', on); chosen = chosen || on; });
      var paths = $('.paths');
      if (paths) paths.classList.toggle('has-choice', chosen);
    }
    choosePath(kind);

    var form = $('#enquiry');
    if (!form) return;
    form.hidden = false;                              /* the form is always shown */
    var el = form.elements, which = $('.which', form), slot = $('.about-slot');
    /* the drawing being asked about: its thumbnail and title above the form, following the "Which drawing?" select */
    function showWhich() {
      var existing = el.kind.value === 'existing';
      which.hidden = !existing;
      el.message.placeholder = PLACEHOLDER[el.kind.value] || PLACEHOLDER.other;
      var w = existing && findWork(el.about.value);
      if (slot) slot.innerHTML = w ? '<a class="about-plate" href="drawings/' + esc(w.id) + '.html"><img src="' + thumb(w) + '" alt="" width="96" height="96">' +
        '<span>You are asking about <em>' + esc(w.title) + '</em>, ' + w.year + '.</span></a>' : '';
    }
    /* one place that brings the page in line with the form: path, drawing line, placeholder.
       pathKind: the kind whose path to bring forward ('' after a reset, so nothing stays highlighted) */
    function sync(pathKind) {
      choosePath(pathKind);
      showWhich();
    }
    if (kind) el.kind.value = kind;
    if (work) el.about.value = work.id;
    el.kind.addEventListener('change', function () { sync(el.kind.value); });

    /* phones only: each path is its heading, a button that opens its description and chooses that subject
       in the form. Wider screens show the paths in full, with plain headings (the buttons are removed). */
    var phone = window.matchMedia ? matchMedia('(max-width: 640px)') : null;
    function pathToggles(on) {
      $$('.path').forEach(function (path, n) {
        var h = $('h2', path), text = $('p', path), b = $('.path-toggle', path);
        if (!h || !text) return;
        if (!on) {
          if (b) { while (b.firstChild) h.insertBefore(b.firstChild, b); b.remove(); }
          path.classList.remove('open');
          return;
        }
        if (b) return;
        text.id = text.id || 'path-text-' + (n + 1);
        b = document.createElement('button');
        b.type = 'button'; b.className = 'path-toggle';
        while (h.firstChild) b.appendChild(h.firstChild);
        h.appendChild(b);
        b.setAttribute('aria-controls', text.id);
        var open = !!kind && path.dataset.kinds.split(' ').indexOf(kind) >= 0;
        path.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open));
        b.addEventListener('click', function () {
          var nowOpen = !path.classList.contains('open');
          path.classList.toggle('open', nowOpen); b.setAttribute('aria-expanded', String(nowOpen));
          if (nowOpen) { el.kind.value = path.dataset.kinds.split(' ')[0]; sync(el.kind.value); }
        });
      });
    }
    pathToggles(!!(phone && phone.matches));
    if (phone) { var onPhone = function () { pathToggles(phone.matches); }; if (phone.addEventListener) phone.addEventListener('change', onPhone); else if (phone.addListener) phone.addListener(onPhone); }
    el.about.addEventListener('change', showWhich);
    sync(kind);

    function fieldError(input, text) {
      var out = document.getElementById(input.getAttribute('aria-describedby'));
      input.setAttribute('aria-invalid', text ? 'true' : 'false');
      if (out) out.textContent = text || '';
      return !text;
    }
    function check() {
      var ok = true, first = null;
      [[el.name, el.name.value.trim() ? '' : MESSAGES.name],
       [el.email, !el.email.value.trim() ? MESSAGES.email : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.email.value.trim()) ? '' : MESSAGES.emailBad)],
       [el.message, el.message.value.trim() ? '' : MESSAGES.message]].forEach(function (pair) {
        if (!fieldError(pair[0], pair[1])) { ok = false; first = first || pair[0]; }
      });
      if (first) first.focus();
      return ok;
    }
    [el.name, el.email, el.message].forEach(function (input) {
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') fieldError(input, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = $('.form-note', form), button = $('button[type=submit]', form);
      if (el._honey.value) return;                   /* honeypot: people never see it, bots fill it */
      if (!check()) return;
      /* not connected: say so, send nothing, keep what was typed */
      if (!SK.formTo) { note.textContent = 'This form isn’t connected yet. Please write on Instagram or LinkedIn for now.'; return; }
      var w = el.kind.value === 'existing' && findWork(el.about.value);
      var kindText = el.kind.options[el.kind.selectedIndex].text;
      button.disabled = true;
      button.textContent = 'Sending…';
      note.textContent = '';
      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(SK.formTo), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'Shilp Kalaa: ' + kindText,
          name: el.name.value, email: el.email.value, kind: kindText,
          drawing: w ? w.title + ', ' + w.year + ' (' + w.id + ')' : '', message: el.message.value,
          _honey: el._honey.value
        })
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function (data) {
        /* success only when FormSubmit says so (an unactivated form answers success: "false") */
        if (!data || !(data.success === true || data.success === 'true')) throw new Error('not confirmed');
        form.reset(); sync('');
        note.textContent = 'Thank you. Your message is on its way, and she will write back.';
      }).catch(function () {
        /* keep what was typed; point to the direct routes (her address is shown only when SK.email is set) */
        note.textContent = SK.email ? 'That did not send. Please try again, or write to her at ' + SK.email + '.'
          : 'That did not send. Please try again, or message her on Instagram.';
      }).then(function () { button.disabled = false; button.textContent = 'Send to Shubhangi'; });
    });
  }

  initSkip();
  initStrip();
  initPatch();
  initWrite();
})();
