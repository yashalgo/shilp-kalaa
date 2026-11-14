#!/usr/bin/env node
/* Shilp Kalaa · search build.  Run from the project folder:   node tools/build.js

   The site works without this, but search engines and AI assistants read the plain HTML, not the script.
   This writes, from assets/works.js and the settings below:
     · the <head> of every page (title, description, canonical address, sharing cards, structured data)
     · one static page per drawing in drawings/
     · the drawing grids as plain HTML inside index.html and work.html
     · the "In brief" facts and the questions on about.html
     · sitemap.xml, robots.txt and llms.txt
   Run it again after changing works.js, the facts below, or the site address. No packages are needed. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, s) => { const p = path.join(ROOT, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const box = { window: {} }; vm.runInNewContext(read('assets/works.js'), box);
const SK = box.window.SK;
const SITE = (SK.site || 'https://shilpkalaa.com/').replace(/\/*$/, '/');
const TODAY = new Date().toISOString().slice(0, 10);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = n => (n < 10 ? '0' : '') + n;

/* ---------- the facts: change them here, then run the build ---------- */
const ARTIST = 'Shubhangi Saxena', STUDIO = 'Shilp Kalaa';
const INSTAGRAM = 'https://www.instagram.com/shilp_kalaa/', LINKEDIN = 'https://www.linkedin.com/in/shubhangi-saxena-ud/';
const MEDIUM = 'Ink on paper';
const SUMMARY = 'Shubhangi Saxena is an Indian nature artist and fine artist who works between India and London under the studio name Shilp Kalaa. She makes intricate pen and ink drawings of moss, forest floors and the small wild plants that live in the cracks of cities.';
const FACTS = [
  ['Artist', 'Shubhangi Saxena'],
  ['Studio', 'Shilp Kalaa'],
  ['Known for', 'Nature art: intricate, fine pen and ink drawings of moss and overlooked urban nature'],
  ['Medium', 'Ink on paper, drawn by hand with a very fine pen'],
  ['Subjects', 'Moss, pavement cracks, brick walls, forest floors, gardens, overgrown houses'],
  ['Also makes', 'Artist\'s books and boxes, floor installations, papermaking workshops'],
  ['Based', 'India and London, United Kingdom'],
  ['Shown', 'Whispers on Bricks at KaalChakra, Asylum Chapel, London, September 2025'],
  ['Elsewhere', '<a href="' + INSTAGRAM + '" rel="me noopener">Instagram @shilp_kalaa</a> · <a href="' + LINKEDIN + '" rel="me noopener">LinkedIn</a>'],
  ['Enquiries', '<a href="commissions.html">Commissions, exhibitions and collaborations</a>']
];
const FAQ = [
  ['Who is Shubhangi Saxena?', SUMMARY],
  ['What is Shilp Kalaa?', 'Shilp Kalaa is the name of Shubhangi Saxena\'s art practice and of her Instagram account, @shilp_kalaa. It holds her ink drawings, her artist\'s books and boxes, her floor installations and her papermaking workshops.'],
  ['What kind of art does she make?', 'Nature art, drawn by hand. Her fine art drawings are made in ink on paper with a very fine pen, and they show moss, brick walls, forest floors, gardens and the wild patches that grow where a pavement has split. Each sheet holds thousands of single lines.'],
  ['How does a drawing begin?', 'With a walk. She stops where something small is growing, photographs it, stays with it, and only then draws. Whispers on Bricks followed six months of observing the mosses on two bricks of one boundary wall.'],
  ['Where has her work been shown?', 'Whispers on Bricks was shown at KaalChakra, at the Asylum Chapel in London, in September 2025. Other projects include Watch Your Step, a book and box described as an ask of the city mosses, floor installations of drawings with found materials, and papermaking workshops.'],
  ['Does she take commissions?', 'Yes. Shubhangi takes on a small number of commissioned drawings each year, and she welcomes enquiries from curators, galleries and collaborators. Write to her through the commissions page of this site or on Instagram at @shilp_kalaa.']
];
const PAGES = {
  'index.html': {
    title: 'Shubhangi Saxena · Nature Artist & Fine Artist, India | Shilp Kalaa',
    desc: 'Shilp Kalaa is the studio of Shubhangi Saxena, an Indian nature artist and fine artist. Intricate pen and ink drawings of moss, forest floors and overlooked urban nature.',
    extra: '<link rel="preload" as="image" href="images/moss-radial.jpg" fetchpriority="high">'
  },
  'work.html': {
    name: 'Work',
    title: 'Ink Drawings of Moss and Nature · Shubhangi Saxena | Shilp Kalaa',
    desc: 'All the drawings by nature artist Shubhangi Saxena, series by series: City Mosses, Whispers on Bricks, Forest Floor, Garden Plans and Overgrown Houses. Open one and zoom in.'
  },
  'projects.html': {
    name: 'Projects',
    title: 'Projects and Exhibitions · Shubhangi Saxena | Shilp Kalaa',
    desc: 'Whispers on Bricks at KaalChakra, London; Watch Your Step, a book and box; floor installations and papermaking workshops by nature artist Shubhangi Saxena.'
  },
  'about.html': {
    name: 'About',
    title: 'About Shubhangi Saxena · Indian Nature Artist | Shilp Kalaa',
    desc: 'Shubhangi Saxena is an Indian nature artist and fine artist working between India and London. She draws moss and overlooked urban nature in ink, slowly, by hand.'
  },
  'commissions.html': {
    name: 'Commissions',
    title: 'Commission a Drawing · Shubhangi Saxena | Shilp Kalaa',
    desc: 'Commission an original pen and ink drawing of a place you love from nature artist Shubhangi Saxena. Curators, galleries and collaborators are welcome to write.'
  },
  'piece.html': { title: 'Drawing · Shilp Kalaa', desc: 'An ink drawing by Shubhangi Saxena. Zoom in to see the single lines.', noindex: true },
  '404.html': { title: 'Nothing growing here · Shilp Kalaa', desc: 'This page could not be found.', noindex: true }
};

/* ---------- structured data ---------- */
const PERSON = {
  '@type': 'Person', '@id': SITE + '#artist', name: ARTIST, alternateName: STUDIO, url: SITE,
  jobTitle: 'Artist', description: SUMMARY,
  nationality: { '@type': 'Country', name: 'India' },
  workLocation: [{ '@type': 'Country', name: 'India' }, { '@type': 'City', name: 'London', containedInPlace: { '@type': 'Country', name: 'United Kingdom' } }],
  knowsAbout: ['Nature art', 'Fine art', 'Pen and ink drawing', 'Botanical drawing', 'Moss', 'Urban nature', 'Environmental art', 'Artist\'s books', 'Papermaking'],
  sameAs: [INSTAGRAM, LINKEDIN]
};
const WEBSITE = { '@type': 'WebSite', '@id': SITE + '#site', url: SITE, name: STUDIO, alternateName: STUDIO + ' · ' + ARTIST, description: PAGES['index.html'].desc, inLanguage: 'en', author: { '@id': SITE + '#artist' }, publisher: { '@id': SITE + '#artist' } };
const seriesOf = w => SK.series.find(s => s.id === w.series) || { title: '' };
const drawingUrl = w => 'drawings/' + w.id + '.html';
const artwork = w => ({
  '@type': 'VisualArtwork', '@id': SITE + drawingUrl(w) + '#artwork', name: w.title, url: SITE + drawingUrl(w),
  image: SITE + 'images/' + w.img, artform: 'Drawing', artMedium: MEDIUM, artworkSurface: 'Paper',
  creator: { '@id': SITE + '#artist' }, isPartOf: { '@type': 'CreativeWorkSeries', name: seriesOf(w).title },
  keywords: 'nature art, pen and ink drawing, moss, fine art'
});
const crumbs = (...items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, file], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + file })) });
const pageNode = (type, file, p, more) => Object.assign({ '@type': type, '@id': SITE + file + '#page', url: SITE + file, name: p.title, description: p.desc, inLanguage: 'en', isPartOf: { '@id': SITE + '#site' }, about: { '@id': SITE + '#artist' } }, more || {});
const LD = {
  'index.html': () => [WEBSITE, PERSON, pageNode('WebPage', '', PAGES['index.html'], { primaryImageOfPage: SITE + 'images/og.jpg' })],
  'work.html': () => [WEBSITE, PERSON, pageNode('CollectionPage', 'work.html', PAGES['work.html'], { mainEntity: { '@type': 'ItemList', numberOfItems: SK.works.length, itemListElement: SK.works.map((w, i) => ({ '@type': 'ListItem', position: i + 1, item: artwork(w) })) } }), crumbs(['Home', ''], ['Work', 'work.html'])],
  'projects.html': () => [WEBSITE, PERSON, pageNode('CollectionPage', 'projects.html', PAGES['projects.html']),
    { '@type': 'ExhibitionEvent', name: 'Whispers on Bricks at KaalChakra', startDate: '2025-09', eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', description: 'Ink drawings by Shubhangi Saxena made after six months of observing mosses on a boundary wall, shown at KaalChakra.', image: SITE + 'images/p-kaal-1.jpg', location: { '@type': 'Place', name: 'Asylum Chapel', address: { '@type': 'PostalAddress', addressLocality: 'London', addressCountry: 'GB' } }, performer: { '@id': SITE + '#artist' } },
    { '@type': 'CreativeWork', name: 'Watch Your Step', alternativeHeadline: 'An ask of the city mosses', description: 'A book and a box of drawings, plates, cards and field notes on city mosses.', creator: { '@id': SITE + '#artist' }, image: SITE + 'images/p-box.jpg' },
    crumbs(['Home', ''], ['Projects', 'projects.html'])],
  'about.html': () => [WEBSITE, PERSON, pageNode('ProfilePage', 'about.html', PAGES['about.html'], { mainEntity: { '@id': SITE + '#artist' } }),
    { '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    crumbs(['Home', ''], ['About', 'about.html'])],
  'commissions.html': () => [WEBSITE, PERSON, pageNode('ContactPage', 'commissions.html', PAGES['commissions.html']),
    { '@type': 'Service', name: 'Commissioned pen and ink drawings', serviceType: 'Art commission', provider: { '@id': SITE + '#artist' }, description: 'Original ink drawings of a place the client knows, drawn by hand by Shubhangi Saxena.', url: SITE + 'commissions.html' },
    crumbs(['Home', ''], ['Commissions', 'commissions.html'])]
};

/* ---------- <head> ---------- */
function head(file, p, ld) {
  const url = SITE + (file === 'index.html' ? '' : file), img = SITE + (p.image || 'images/og.jpg');
  return [
    '<!-- seo: written by tools/build.js. Change the text there, not here. -->',
    '<title>' + esc(p.title) + '</title>',
    '<meta name="description" content="' + esc(p.desc) + '">',
    '<meta name="author" content="' + ARTIST + '">',
    p.noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">',
    p.noindex ? '' : '<link rel="canonical" href="' + url + '">',
    '<meta property="og:site_name" content="' + STUDIO + '">',
    '<meta property="og:type" content="' + (p.ogType || 'website') + '">',
    '<meta property="og:title" content="' + esc(p.title) + '">',
    '<meta property="og:description" content="' + esc(p.desc) + '">',
    '<meta property="og:url" content="' + url + '">',
    '<meta property="og:image" content="' + img + '">',
    '<meta property="og:image:alt" content="' + esc(p.imageAlt || 'A pen and ink drawing of moss by Shubhangi Saxena') + '">',
    '<meta property="og:locale" content="en_IN">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + esc(p.title) + '">',
    '<meta name="twitter:description" content="' + esc(p.desc) + '">',
    '<meta name="twitter:image" content="' + img + '">',
    '<meta name="theme-color" content="#f3efe6">',
    '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
    '<link rel="me" href="' + INSTAGRAM + '">',
    '<link rel="me" href="' + LINKEDIN + '">',
    p.extra || '',
    ld ? '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@graph': ld }).replace(/</g, '\\u003c') + '</script>' : '',
    '<noscript><style>.rv{opacity:1;transform:none}</style></noscript>',
    '<!-- /seo -->'
  ].filter(Boolean).join('\n');
}
function setHead(html, block) {
  html = html.replace(/\n<link rel="icon" href="data:,">/, '');
  if (html.includes('<!-- seo:')) return html.replace(/<!-- seo:[\s\S]*?<!-- \/seo -->/, () => block);
  return html.replace(/<title>[\s\S]*?<meta name="description"[^>]*>/, () => block);
}

/* ---------- plain-HTML drawing grids (the same markup assets/site.js draws) ---------- */
const BY = 'pen and ink drawing by Shubhangi Saxena';
const plate = w => '<figure class="rv"><a href="' + drawingUrl(w) + '"><div class="frame"><img class="ink" src="images/' + w.img + '" alt="' + esc(w.title) + ', ' + BY + '" loading="lazy"></div>' +
  '<figcaption><b class="t">' + esc(w.title) + '</b><span class="lab">Pl. ' + pad(SK.works.indexOf(w) + 1) + ' · ' + w.year + '</span></figcaption></a></figure>';
const attr = (tag, name) => { const m = tag.match(new RegExp(' data-' + name + '="([^"]*)"')); return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : ''; };
function grids(html) {
  return html.replace(/(<section class="plates" data-(plates|pick)="[^"]*"[^>]*>)[\s\S]*?(<\/section>)/g, (all, open, kind, close) => {
    let inner;
    if (kind === 'plates') {
      const s = SK.series.find(x => x.id === attr(open, 'plates')); if (!s) return all;
      const works = SK.works.filter(w => w.series === s.id), limit = +attr(open, 'limit'), shown = limit ? works.slice(0, limit) : works;
      inner = '<div class="series" id="' + s.id + '"><span class="lab">Series ' + pad(SK.series.indexOf(s) + 1) + '</span><h2 class="t">' + esc(s.title) + '</h2><span class="lab">' + s.years + ' · ' + works.length + (works.length === 1 ? ' plate' : ' plates') + '</span></div>' +
        (s.note ? '<p class="series-note">' + esc(s.note) + '</p>' : '') + '<div class="grid">' + shown.map(plate).join('') + '</div>' +
        (shown.length < works.length ? '<p class="more"><a class="line" href="work.html#' + s.id + '">All of ' + esc(s.title) + '</a></p>' : '');
    } else {
      const shown = attr(open, 'pick').split(',').map(id => SK.works.find(w => w.id === id.trim())).filter(Boolean), yrs = SK.works.map(w => w.year);
      inner = '<div class="series"><span class="lab">' + esc(attr(open, 'label') || 'Selected') + '</span><h2 class="t">' + esc(attr(open, 'title') || 'Selected drawings') + '</h2><span class="lab">' + Math.min(...yrs) + ' – ' + Math.max(...yrs) + ' · ' + SK.works.length + ' plates in all</span></div>' +
        (attr(open, 'note') ? '<p class="series-note">' + esc(attr(open, 'note')) + '</p>' : '') + '<div class="grid">' + shown.map(plate).join('') + '</div>' +
        '<p class="more"><a class="line" href="work.html">All the drawings, series by series</a></p>';
    }
    return open + inner + close;
  });
}

/* ---------- about: facts and questions ---------- */
function facts(html) {
  const block = '<!-- facts -->\n      <section class="cv rv">\n        <h2 class="lab">In brief</h2>\n        <dl>\n' +
    FACTS.map(([k, v]) => '          <dt class="lab">' + k + '</dt><dd>' + v + '</dd>').join('\n') + '\n        </dl>\n      </section>\n\n' +
    '      <section class="faq rv">\n        <h2 class="lab">Questions people ask</h2>\n' +
    FAQ.map(([q, a]) => '        <div><h3>' + esc(q) + '</h3><p>' + esc(a) + '</p></div>').join('\n') + '\n      </section>\n      <!-- /facts -->';
  return html.replace(/<!-- facts -->[\s\S]*?<!-- \/facts -->/, () => block);
}

/* ---------- write the ordinary pages ---------- */
for (const file of Object.keys(PAGES)) {
  if (!fs.existsSync(path.join(ROOT, file))) continue;
  let html = setHead(read(file), head(file, PAGES[file], LD[file] ? LD[file]() : null));
  html = grids(html);
  if (file === 'about.html') html = facts(html);
  write(file, html);
}

/* ---------- one static page per drawing ---------- */
const shell = read('piece.html');
fs.rmSync(path.join(ROOT, 'drawings'), { recursive: true, force: true });
SK.works.forEach((w, i) => {
  const n = SK.works.length, prev = SK.works[(i + n - 1) % n], next = SK.works[(i + 1) % n], s = seriesOf(w), file = drawingUrl(w);
  const p = {
    title: w.title + ' · Ink drawing by ' + ARTIST + ' | ' + STUDIO,
    desc: w.title + ', ' + w.year + '. A pen and ink drawing on paper from the series ' + s.title + ' by nature artist ' + ARTIST + '. Zoom in until the moss comes apart into single lines.',
    image: 'images/' + w.img, imageAlt: w.title + ', ' + BY, ogType: 'article'
  };
  const image = { '@type': 'ImageObject', contentUrl: SITE + 'images/' + w.img, name: w.title, caption: w.title + ', ' + BY, creator: { '@id': SITE + '#artist' }, creditText: ARTIST, copyrightNotice: '© ' + ARTIST, acquireLicensePage: SITE + 'commissions.html' };
  const ld = [WEBSITE, PERSON, Object.assign(artwork(w), { description: p.desc, image }), pageNode('WebPage', file, p, { mainEntity: { '@id': SITE + file + '#artwork' } }), crumbs(['Home', ''], ['Work', 'work.html'], [w.title, file])];
  const body = '<main class="a-piece piece" data-piece="' + w.id + '">' +
    '<div class="a-view"><div class="zoom"><img class="ink" src="images/' + w.img + '" alt="' + esc(w.title) + ', ' + BY + '"></div></div>' +
    '<aside class="a-data"><div><p class="lab">Pl. ' + pad(i + 1) + '</p><h1 class="t">' + esc(w.title) + '</h1></div>' +
    '<dl><dt class="lab">Artist</dt><dd><a href="about.html">' + ARTIST + '</a></dd><dt class="lab">Series</dt><dd><a href="work.html#' + w.series + '">' + esc(s.title) + '</a></dd><dt class="lab">Year</dt><dd>' + w.year + '</dd><dt class="lab">Medium</dt><dd>' + esc(w.medium || MEDIUM) + '</dd><dt class="lab">Size</dt><dd>' + esc(w.size) + '</dd></dl>' +
    '<div class="a-end"><a class="line" href="commissions.html?about=' + encodeURIComponent(w.title) + '">Ask about this drawing</a>' +
    '<nav class="a-nav lab" aria-label="More drawings"><a href="' + drawingUrl(prev) + '">← Previous</a><a href="' + drawingUrl(next) + '">Next →</a></nav></div></aside></main>';
  let html = setHead(shell, head(file, p, ld));
  html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="../">');
  html = html.replace(/<main class="a-piece piece" data-piece[^>]*>[\s\S]*?<\/main>/, () => body);
  write(file, html);
});

/* ---------- sitemap, robots, llms.txt ---------- */
const urls = [['', ['images/og.jpg']], ['work.html', []], ['projects.html', ['images/p-kaal-1.jpg', 'images/p-box.jpg', 'images/p-floor-1.jpg']], ['about.html', ['images/about.jpg']], ['commissions.html', []]]
  .concat(SK.works.map(w => [drawingUrl(w), ['images/' + w.img]]));
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
  urls.map(([u, imgs]) => '  <url><loc>' + SITE + u + '</loc><lastmod>' + TODAY + '</lastmod>' + imgs.map(i => '<image:image><image:loc>' + SITE + i + '</image:loc></image:image>').join('') + '</url>').join('\n') + '\n</urlset>\n');
const BOTS = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'DuckAssistBot', 'CCBot'];
write('robots.txt', '# Everyone is welcome, search engines and AI assistants included.\nUser-agent: *\nAllow: /\n\n' + BOTS.map(b => 'User-agent: ' + b + '\nAllow: /\n').join('\n') + '\nSitemap: ' + SITE + 'sitemap.xml\n');
write('llms.txt', '# ' + STUDIO + ' · ' + ARTIST + '\n\n> ' + SUMMARY + '\n\n## Facts\n\n' +
  FACTS.map(([k, v]) => '- ' + k + ': ' + v.replace(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g, (m, h, t) => t + ' (' + (/^http/.test(h) ? h : SITE + h) + ')')).join('\n') +
  '\n\n## Questions\n\n' + FAQ.map(([q, a]) => '### ' + q + '\n' + a).join('\n\n') +
  '\n\n## Pages\n\n- [Home](' + SITE + '): who she is and how a drawing begins\n- [Work](' + SITE + 'work.html): every drawing, by series\n- [Projects](' + SITE + 'projects.html): exhibitions, books, installations and workshops\n- [About](' + SITE + 'about.html): the artist, in her studio\'s words\n- [Commissions](' + SITE + 'commissions.html): how to commission a drawing or write to her\n\n## Drawings\n\n' +
  SK.works.map(w => '- [' + w.title + '](' + SITE + drawingUrl(w) + '): ' + MEDIUM.toLowerCase() + ', ' + w.year + ', series ' + seriesOf(w).title).join('\n') + '\n');

console.log('Built for ' + SITE + ' · ' + Object.keys(PAGES).length + ' pages, ' + SK.works.length + ' drawing pages, sitemap with ' + urls.length + ' addresses.');
