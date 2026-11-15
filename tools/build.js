#!/usr/bin/env node
/* Shilp Kalaa · site build.  Run from anywhere:   node tools/build.js
   (After adding or replacing images, run  python3 tools/images.py  first.)

   The site is plain HTML. This script writes the parts that must stay identical across pages, or
   that come from the data in assets/works.js, into clearly marked regions:

       <!-- generated: NAME · tools/build.js --> … <!-- /generated: NAME -->

   Everything outside those regions is hand-written and is left byte-for-byte as it was.

   Regions, and where they live
     head      every page, inside <head>: title, description, canonical, sharing cards, fonts,
               stylesheets (site.css plus the page's own `css`), structured data (JSON-LD)
     chrome    every page, start of <body>: skip link, header and navigation (from NAV)
     footer    every page, after <main>
     scripts   every page, end of <body>: works.js, site.js, then the page's own `js`
     facts     about.html: the "In brief" facts (FACTS)
     questions about.html: the questions people ask (FAQ)
     contact   commissions.html: the direct routes, plus a mailto line when SK.email (her public address) is set
     drawing-options  commissions.html: the "Which drawing?" list, one option per work
   Also generated:
     · the Work catalogue inside <section class="catalogue" data-catalogue></section><!-- /catalogue -->
       (series strip and justified rows; see catalogue() below)
     · the plate grids inside <section class="plates" data-plates="series-id"> and
       <section class="plates" data-pick="id,id,…">
     · every drawings/<id>.html page, whole (template: drawingMain below)
     · piece.html (old address: forwards ?id=… to drawings/<id>.html)
     · sitemap.xml, robots.txt, llms.txt

   Safety: the data is validated first, every output is produced in memory, written to a staging
   folder, and only then moved into place. A file whose content has not changed is not rewritten. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = file => fs.existsSync(path.join(ROOT, file));

/* ---------- the data: assets/works.js and images/manifest.json ---------- */
function loadWorks() {
  const box = { window: {} };
  vm.runInNewContext(read('assets/works.js'), box, { filename: 'assets/works.js' });
  return box.window.SK;
}
const SK = loadWorks();
const MANIFEST = exists('images/manifest.json') ? JSON.parse(read('images/manifest.json')).images || {} : {};
const SITE = (SK.site || 'https://shilpkalaa.com/').replace(/\/*$/, '/');

/* =====================================================================================
   THE WORDS. Titles, descriptions, facts and questions used by search engines and AI
   assistants. Replace the text here, then run the build.
   ===================================================================================== */
const ARTIST = 'Shubhangi Saxena';
const STUDIO = 'Shilp Kalaa';
const INSTAGRAM = 'https://www.instagram.com/shilp_kalaa/';
const LINKEDIN = 'https://www.linkedin.com/in/shubhangi-saxena-ud/';
const MEDIUM = 'Pen and ink on paper';                    /* default; a work's own `medium` wins */
const BY = 'pen and ink drawing by ' + ARTIST;            /* ends every drawing's alt text */
const DEFAULT_IMAGE = 'og.jpg';                             /* sharing image, in images/ */
const DEFAULT_IMAGE_ALT = 'A pen and ink drawing of moss by ' + ARTIST;

const SUMMARY = 'Shubhangi Saxena is a nature artist and fine artist from India who works in India and London under the name Shilp Kalaa. She makes fine pen and ink drawings of moss, small wild plants and forest floors from close observation, and in 2025 showed Whispers on Bricks at KaalChakra, part of London Design Festival.';

/* The paragraph under the summary at the top of llms.txt. */
const LLMS_INTRO = 'Her moss work began, in her own words, with "choosing a site" and the "wild patches of plant species, found in nobody\'s land", and with Robin Wall Kimmerer\'s book Gathering Moss. She also makes paper with moss in the pulp, floor installations with found materials, and a box set, City Mosses. Sizes, titles and materials of individual drawings are not yet published.';

/* "In brief" on about.html and the Facts list in llms.txt. Values may hold links. */
const FACTS = [
  ['Artist', 'Shubhangi Saxena'],
  ['Works as', 'Shilp Kalaa'],
  ['Practice', 'Nature artist and fine artist: pen and ink drawings of moss, small wild plants and forest floors'],
  ['Medium', 'Pen and ink on paper, including paper she makes with moss in the pulp'],
  ['Subjects', 'Moss in pavements and on brick walls, plants in cracks, forest floors, gardens from above, overgrown houses'],
  ['Also makes', 'Floor installations with found materials, a box set and book (City Mosses), handmade paper'],
  ['From', 'India'],
  ['Works in', 'India and London, United Kingdom'],
  ['Shown', 'KaalChakra by OSA studio, London Design Festival 2025, Asylum Chapel, London, 14–15 September 2025'],
  ['Elsewhere', '<a href="' + INSTAGRAM + '" rel="me noopener">Instagram @shilp_kalaa</a> · <a href="' + LINKEDIN + '" rel="me noopener">LinkedIn</a>'],
  ['Enquiries', '<a href="commissions.html">Write to Shubhangi</a>']
];

/* Questions on about.html (in a closed <details>), in the FAQPage structured data and in llms.txt. Plain text. */
const FAQ = [
  ['Who is Shubhangi Saxena?', SUMMARY],
  ['What is Shilp Kalaa?', 'Shilp Kalaa is the name Shubhangi Saxena works under. It is the name on her 2023 desk calendar of house drawings, and her Instagram handle, @shilp_kalaa.'],
  ['What does she draw?', 'Moss and the small wild plants that grow in pavements and on walls, drawn in pen and ink from close observation and from her own photographs. Earlier work includes dense forest landscapes (2021–2022), gardens seen from above (2023) and overgrown houses (2019–2020).'],
  ['How did the moss work begin?', 'In her own account, it began with choosing a site: she looked around her surroundings and was drawn to “the wild patches of plant species, found in nobody\'s land”. A podcast, Democracy of species, introduced her to the botanist Robin Wall Kimmerer, and she read Kimmerer\'s book Gathering Moss.'],
  ['Where has her work been shown?', 'Whispers on Bricks was shown in KaalChakra, a group exhibition by OSA studio for London Design Festival 2025, at the Asylum Chapel in London on 14 and 15 September 2025. In 2024 she showed drawings in floor installations, one of them labelled Encounter moss / From the soil.'],
  ['Does she take commissions?', 'She welcomes enquiries about commissioned drawings, exhibitions and collaborations. Write to her through the Write page of this site or on Instagram at @shilp_kalaa.']
];

/* Structured-data descriptions of the exhibition, the box set and the commission service. */
const EXHIBITION = {
  name: 'KaalChakra',
  description: 'Group exhibition including Whispers on Bricks, an ink drawing by Shubhangi Saxena of mosses on two bricks of a boundary wall.',
  startDate: '2025-09-14', endDate: '2025-09-15',
  organizer: 'OSA studio', superEvent: 'London Design Festival 2025',
  image: 'bricks-1.jpg',
  venue: 'Asylum Chapel', street: 'Caroline Gardens, Asylum Rd', postcode: 'SE15 2SQ', city: 'London', country: 'GB'
};
const BOOK = { name: 'Watch Your Step', alternativeHeadline: 'an ask of the city mosses', description: 'A box set titled City Mosses, with loose ink drawings, cards and leaflets, and a post-bound book of drawings.', image: 'p-box.jpg' };
const SERVICE = { name: 'Commissioned pen and ink drawings', serviceType: 'Art commission', description: 'Pen and ink drawings of a place the client knows, by Shubhangi Saxena. Enquiries welcome.' };

/* Title and description of a drawing page. */
const drawingTitle = w => {
  const t = w.title + ', ' + w.year + ' · Ink drawing by ' + ARTIST;
  return (t + ' | ' + STUDIO).length <= 65 ? t + ' | ' + STUDIO : t;
};
const firstSentence = text => (String(text || '').match(/^.*?[.!?](?=\s|$)/) || [''])[0];
const cutAtWord = (text, max) => {
  if (text.length < max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:·\s]+$/, '') + '…';
};
/* Ends at a sentence boundary: the description's first sentence is added only when the whole fits in 160 characters. */
const drawingDesc = (w, s) => {
  const base = w.title + ' (' + w.year + '), a pen and ink drawing from ' + s.title + ' by nature artist ' + ARTIST + '.';
  const full = base + ' ' + firstSentence(w.desc);
  return full.length <= 160 ? full.trim() : base;
};

/* llms.txt: one line per page. */
const LLMS_PAGES = [
  ['Home', '', 'who she is, one drawing in close-up, Whispers on Bricks'],
  ['Work', 'work.html', 'every drawing, by series'],
  ['Process', 'process.html', 'how a drawing is made, from the site to the floor'],
  ['Projects', 'projects.html', 'exhibitions, the City Mosses box, installations, paper'],
  ['About', 'about.html', 'her own account, her path 2019–2025, CV'],
  ['Write', 'commissions.html', 'commissions, exhibitions and collaborations']
];

/* =====================================================================================
   THE PAGES. One entry per hand-written page.
     title, desc   <title> and description (also used for sharing cards)
     crumb         its name in breadcrumbs (omit for home)
     ld            the page's own structured data (see LD below)
     image         sharing image in images/ (default og.jpg)
     css, js       extra stylesheets / scripts for this page only, after site.css / site.js
     sitemapImages images listed for this page in sitemap.xml
     noindex       keep out of search results and the sitemap
   To add a page: add an entry here, create the file with <main id="main">…</main>, run the build.
   ===================================================================================== */
const STORY = { css: ['assets/story.css'], js: ['assets/story.js'] };   /* owned by the story builder */
const CATALOGUE = { css: ['assets/catalogue.css'], js: ['assets/catalogue.js'], sizeImages: true };   /* Work, Projects, Write, 404, drawing pages */
const PAGES = {
  'index.html': {
    title: 'Shubhangi Saxena · Nature artist from India | Shilp Kalaa',
    desc: 'Fine pen and ink drawings of moss, small wild plants and forest floors by Shubhangi Saxena, a nature artist and fine artist from India working in London.',
    ld: 'home', sitemapImages: ['og.jpg'], footer: 'short', ...STORY
  },
  'work.html': {
    crumb: 'Work',
    title: 'Pen and ink drawings · Shubhangi Saxena | Shilp Kalaa',
    desc: 'Ink drawings by nature artist Shubhangi Saxena, 2019–2025: Whispers on Bricks, City Mosses, Garden Plans, Forest Floor and Overgrown Houses.',
    ld: 'work', ...CATALOGUE
  },
  'process.html': {
    crumb: 'Process',
    title: 'How she works · Shubhangi Saxena | Shilp Kalaa',
    desc: 'From a photograph of a pavement to a finished ink drawing: the site, the reading, paper made with moss, the pen and the floor. The method of Shubhangi Saxena.',
    ld: 'process', footer: 'short', ...STORY
  },
  'projects.html': {
    crumb: 'Projects',
    title: 'Exhibitions and projects · Shubhangi Saxena | Shilp Kalaa',
    desc: 'Whispers on Bricks at KaalChakra, London Design Festival 2025; the City Mosses box; floor installations; moss paper. Projects by nature artist Shubhangi Saxena.',
    ld: 'projects', sitemapImages: ['bricks-1.jpg', 'wob-card.jpg', 'p-box.jpg', 'p-floor-1.jpg', 'moss-paper-09-drawing-raking-light.jpg'], ...CATALOGUE
  },
  'about.html': {
    crumb: 'About',
    title: 'About Shubhangi Saxena · Fine artist from India | Shilp Kalaa',
    desc: 'Shubhangi Saxena, a fine artist and nature artist from India, in her own words: how her ink drawings of moss began, her path from 2019 to 2025, and a short CV.',
    ld: 'about', sitemapImages: ['about.jpg'], ...STORY
  },
  'commissions.html': {
    crumb: 'Write',
    title: 'Write to Shubhangi Saxena · Commissions | Shilp Kalaa',
    desc: 'Ask about a pen and ink drawing of a place you know, or propose an exhibition or collaboration with Shubhangi Saxena, nature artist from India.',
    ld: 'contact', ...CATALOGUE
  },
  '404.html': { title: 'Nothing growing here · Shilp Kalaa', desc: 'This page could not be found.', noindex: true, ...CATALOGUE }
};
const PIECE = { title: 'Drawing · Shilp Kalaa', desc: 'A pen and ink drawing by Shubhangi Saxena.', noindex: true };

/* The navigation: one line per item. `match` is the page that marks it current. */
const NAV = [
  { label: 'Work', href: 'work.html' },
  { label: 'Process', href: 'process.html' },
  { label: 'Projects', href: 'projects.html' },
  { label: 'About', href: 'about.html' },
  { label: 'Write', href: 'commissions.html' }
];

const AI_AND_SEARCH_BOTS = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'DuckAssistBot', 'CCBot'];

const FONTS_CSS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&display=swap';

/* ---------- small helpers ---------- */
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const pageUrl = file => SITE + (file === 'index.html' ? '' : file);
const drawingFile = w => 'drawings/' + w.id + '.html';
const seriesOf = w => SK.series.find(s => s.id === w.series);
const plateNo = w => pad(SK.works.indexOf(w) + 1);
const sizeShown = w => w.sizeConfirmed === true;           /* the size gate: no size anywhere unless confirmed */
const altOf = w => w.alt || w.title + ', ' + BY;

/* =====================================================================================
   IMAGES. tools/images.py writes resized copies to images/generated/ and lists them in
   images/manifest.json. If an image is missing from the manifest the original is used,
   with its dimensions read from the file itself.
   ===================================================================================== */
const SIZES = {
  grid: '(max-width:640px) calc(50vw - 28px), (max-width:1000px) calc(50vw - 68px), 30vw',
  viewer: '(max-width:1000px) 100vw, calc(100vw - 480px)'
};
function readDimensions(file) {
  const buf = fs.readFileSync(path.join(ROOT, 'images', file));
  if (buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };   /* PNG */
  for (let i = 2; i < buf.length - 9;) {                                                                             /* JPEG: find the frame header */
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('cannot read the size of images/' + file);
}
function imageInfo(file) {
  return MANIFEST[file] || Object.assign({ variants: [] }, readDimensions(file));
}
const srcset = (info, kind) => info.variants.map(v => v[kind] + ' ' + v.width + 'w').join(', ');

/* An <img> (wrapped in <picture> with WebP when derivatives exist).
   priority: true for the one image a page is about (eager, high fetch priority). */
function picture(file, alt, { cls = 'ink', sizes = SIZES.grid, priority = false } = {}) {
  const info = imageInfo(file);
  const loading = priority ? 'loading="eager" fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
  const img = '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="images/' + esc(file) + '" alt="' + esc(alt) + '" width="' + info.width + '" height="' + info.height + '"' +
    (info.variants.length ? ' srcset="' + srcset(info, 'jpeg') + '" sizes="' + sizes + '"' : '') + ' ' + loading + '>';
  if (!info.variants.length) return img;
  return '<picture><source type="image/webp" srcset="' + srcset(info, 'webp') + '" sizes="' + sizes + '">' + img + '</picture>';
}

/* =====================================================================================
   VALIDATION. Runs before anything is written; the build stops on the first problem.
   ===================================================================================== */
function validate() {
  const problems = [];
  const ids = new Set();
  if (!SK || !Array.isArray(SK.works) || !Array.isArray(SK.series)) throw new Error('assets/works.js must define window.SK with works and series');
  for (const s of SK.series) if (!s.id || !s.title) problems.push('a series is missing its id or title');
  for (const w of SK.works) {
    const name = w.id || '(no id)';
    if (!/^[a-z0-9-]+$/.test(w.id || '')) problems.push(name + ': id must be lower-case letters, digits and hyphens');
    if (ids.has(w.id)) problems.push(name + ': id used twice');
    ids.add(w.id);
    if (!w.title) problems.push(name + ': no title');
    if (!Number.isInteger(w.year)) problems.push(name + ': year must be a whole number');
    if (!seriesOf(w)) problems.push(name + ': unknown series "' + w.series + '"');
    if (!w.img || !exists('images/' + w.img)) problems.push(name + ': image images/' + w.img + ' not found');
    if (w.sizeConfirmed && (!w.size || !(w.mm > 0))) problems.push(name + ': sizeConfirmed needs both size and mm');
    for (const look of w.looks || []) if (!(look.name && look.x >= 0 && look.x <= 1 && look.y >= 0 && look.y <= 1 && look.s >= 1)) problems.push(name + ': a close look needs name, x and y between 0 and 1, s of at least 1');
  }
  for (const file of Object.keys(PAGES)) if (!exists(file)) problems.push(file + ' is listed in PAGES but does not exist');
  if (problems.length) throw new Error('assets/works.js or PAGES has problems:\n  - ' + problems.join('\n  - '));
}

/* =====================================================================================
   STRUCTURED DATA (schema.org JSON-LD)
   ===================================================================================== */
const ID = { site: SITE + '#site', artist: SITE + '#artist' };
const PERSON = {
  '@type': 'Person', '@id': ID.artist, name: ARTIST, alternateName: STUDIO, url: SITE,
  jobTitle: 'Artist', description: SUMMARY,
  nationality: { '@type': 'Country', name: 'India' },
  workLocation: [{ '@type': 'Country', name: 'India' }, { '@type': 'City', name: 'London', containedInPlace: { '@type': 'Country', name: 'United Kingdom' } }],
  knowsAbout: ['Nature art', 'Fine art', 'Pen and ink drawing', 'Moss', 'Urban nature', 'Handmade paper', 'Installation art'],
  sameAs: [INSTAGRAM, LINKEDIN],
  performerIn: {
    '@type': 'ExhibitionEvent', name: 'KaalChakra',
    description: 'A group exhibition by OSA studio, part of London Design Festival 2025, at Asylum Chapel, London, 14–15 September 2025, showing Whispers on Bricks by Shubhangi Saxena.',
    startDate: '2025-09-14', endDate: '2025-09-15',
    organizer: { '@type': 'Organization', name: 'OSA studio' }, superEvent: { '@type': 'Event', name: 'London Design Festival 2025' },
    location: { '@type': 'Place', name: 'Asylum Chapel', address: { '@type': 'PostalAddress', streetAddress: 'Caroline Gardens, Asylum Rd', postalCode: 'SE15 2SQ', addressLocality: 'London', addressCountry: 'GB' } }
  }
};
const WEBSITE = {
  '@type': 'WebSite', '@id': ID.site, url: SITE, name: STUDIO, alternateName: STUDIO + ' · ' + ARTIST,
  description: PAGES['index.html'].desc, inLanguage: 'en', author: { '@id': ID.artist }, publisher: { '@id': ID.artist }
};
function webPage(type, file, p, more) {
  const url = pageUrl(file);
  return Object.assign({ '@type': type, '@id': url + '#page', url, name: p.title, description: p.desc, inLanguage: 'en', isPartOf: { '@id': ID.site }, about: { '@id': ID.artist } }, more || {});
}
function breadcrumbs(...items) {
  return { '@type': 'BreadcrumbList', itemListElement: [['Home', 'index.html'], ...items].map(([name, file], i) => ({ '@type': 'ListItem', position: i + 1, name, item: pageUrl(file) })) };
}
function artwork(w) {
  const node = {
    '@type': 'VisualArtwork', '@id': SITE + drawingFile(w) + '#artwork', name: w.title, url: SITE + drawingFile(w),
    image: SITE + 'images/' + w.img, dateCreated: String(w.year), artform: 'Drawing', artMedium: w.medium || MEDIUM, artworkSurface: 'Paper',
    creator: { '@id': ID.artist }, isPartOf: { '@type': 'CreativeWorkSeries', name: seriesOf(w).title },
    keywords: 'nature art, pen and ink drawing, moss, fine art'
  };
  if (sizeShown(w)) node.width = { '@type': 'Distance', name: (w.mm / 10) + ' cm' };
  return node;
}
function imageObject(w) {
  const info = imageInfo(w.img);
  return {
    '@type': 'ImageObject', contentUrl: SITE + 'images/' + w.img, width: info.width, height: info.height, name: w.title, caption: altOf(w),
    creator: { '@id': ID.artist }, creditText: ARTIST, copyrightNotice: '© ' + ARTIST, acquireLicensePage: SITE + 'commissions.html'
  };
}
const LD = {
  home: (file, p) => [WEBSITE, PERSON, webPage('WebPage', file, p, { primaryImageOfPage: SITE + 'images/' + DEFAULT_IMAGE })],
  work: (file, p) => [WEBSITE, PERSON,
    webPage('CollectionPage', file, p, { mainEntity: { '@type': 'ItemList', numberOfItems: SK.works.length, itemListElement: SK.works.map((w, i) => ({ '@type': 'ListItem', position: i + 1, item: artwork(w) })) } }),
    ...SK.series.map(s => ({
      '@type': 'CreativeWorkSeries', '@id': pageUrl(file) + '#' + s.id, name: s.title, url: pageUrl(file) + '#' + s.id, description: s.note,
      creator: { '@id': ID.artist }, hasPart: SK.works.filter(w => w.series === s.id).map(w => ({ '@id': SITE + drawingFile(w) + '#artwork' }))
    })),
    breadcrumbs([p.crumb, file])],
  process: (file, p) => [WEBSITE, PERSON, webPage('WebPage', file, p), breadcrumbs([p.crumb, file])],
  projects: (file, p) => [WEBSITE, PERSON, webPage('CollectionPage', file, p),
    {
      '@type': 'ExhibitionEvent', name: EXHIBITION.name, description: EXHIBITION.description,
      startDate: EXHIBITION.startDate, endDate: EXHIBITION.endDate,
      /* a past event keeps EventScheduled: schema.org has no "completed" status; the past dates say it is over */
      eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      image: SITE + 'images/' + EXHIBITION.image,
      organizer: { '@type': 'Organization', name: EXHIBITION.organizer },
      superEvent: { '@type': 'Event', name: EXHIBITION.superEvent },
      location: { '@type': 'Place', name: EXHIBITION.venue, address: { '@type': 'PostalAddress', streetAddress: EXHIBITION.street, postalCode: EXHIBITION.postcode, addressLocality: EXHIBITION.city, addressCountry: EXHIBITION.country } },
      performer: { '@id': ID.artist }
    },
    { '@type': 'CreativeWork', name: BOOK.name, alternativeHeadline: BOOK.alternativeHeadline, description: BOOK.description, creator: { '@id': ID.artist }, image: SITE + 'images/' + BOOK.image },
    breadcrumbs([p.crumb, file])],
  about: (file, p) => [WEBSITE, PERSON, webPage('ProfilePage', file, p, { mainEntity: { '@id': ID.artist } }),
    { '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    breadcrumbs([p.crumb, file])],
  contact: (file, p) => [WEBSITE, PERSON, webPage('ContactPage', file, p),
    Object.assign({ '@type': 'Service', provider: { '@id': ID.artist }, url: pageUrl(file) }, SERVICE),
    breadcrumbs([p.crumb, file])],
  drawing: (file, p, w) => [WEBSITE, PERSON,
    Object.assign(artwork(w), { description: p.desc, image: imageObject(w) }),
    webPage('WebPage', file, p, { mainEntity: { '@id': SITE + file + '#artwork' } }),
    breadcrumbs(['Work', 'work.html'], [w.title, file])]
};
const jsonLd = graph => '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c') + '</script>';

/* =====================================================================================
   GENERATED REGIONS
   ===================================================================================== */
const open = name => '<!-- generated: ' + name + ' · tools/build.js -->';
const close = name => '<!-- /generated: ' + name + ' -->';
const region = (name, body) => open(name) + body + close(name);
const regionPattern = name => new RegExp('<!-- generated: ' + name + '\\b[^>]*-->[\\s\\S]*?<!-- \\/generated: ' + name + ' -->');

/* Replace a region, or, if the page does not have it yet, take over a legacy block or insert it. */
function setRegion(html, name, block, { legacy, insert } = {}) {
  if (regionPattern(name).test(html)) return html.replace(regionPattern(name), () => block);
  if (legacy && legacy.test(html)) return html.replace(legacy, () => block);
  if (insert) return insert(html, block);
  return html;
}

/* <head>: everything after the charset and viewport lines. */
function headRegion(file, p, { ld, image = DEFAULT_IMAGE, imageAlt = DEFAULT_IMAGE_ALT, ogType = 'website' } = {}) {
  const url = pageUrl(file);
  const info = imageInfo(image);
  const imageUrl = SITE + 'images/' + image;
  const lines = [
    '<title>' + esc(p.title) + '</title>',
    '<meta name="description" content="' + esc(p.desc) + '">',
    '<meta name="author" content="' + ARTIST + '">',
    '<meta name="robots" content="' + (p.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1') + '">',
    p.noindex ? '' : '<link rel="canonical" href="' + url + '">',
    '<meta property="og:site_name" content="' + STUDIO + '">',
    '<meta property="og:type" content="' + ogType + '">',
    '<meta property="og:title" content="' + esc(p.title) + '">',
    '<meta property="og:description" content="' + esc(p.desc) + '">',
    '<meta property="og:url" content="' + url + '">',
    '<meta property="og:image" content="' + imageUrl + '">',
    '<meta property="og:image:alt" content="' + esc(imageAlt) + '">',
    '<meta property="og:image:width" content="' + info.width + '">',
    '<meta property="og:image:height" content="' + info.height + '">',
    '<meta property="og:image:type" content="' + (/\.png$/i.test(image) ? 'image/png' : 'image/jpeg') + '">',
    '<meta property="og:locale" content="en_IN">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + esc(p.title) + '">',
    '<meta name="twitter:description" content="' + esc(p.desc) + '">',
    '<meta name="twitter:image" content="' + imageUrl + '">',
    '<meta name="twitter:image:alt" content="' + esc(imageAlt) + '">',
    '<meta name="theme-color" content="#f3efe6">',
    '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
    '<link rel="me" href="' + INSTAGRAM + '">',
    '<link rel="me" href="' + LINKEDIN + '">',
    /* fonts load without blocking the first paint */
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="stylesheet" href="' + FONTS_CSS + '" media="print" onload="this.media=\'all\'">',
    '<noscript><link rel="stylesheet" href="' + FONTS_CSS + '"></noscript>',
    '<link rel="stylesheet" href="assets/site.css">',
    ...(p.css || []).map(href => '<link rel="stylesheet" href="' + href + '">'),
    /* lets CSS hide things that only scripts reveal (e.g. the fade-in), so nothing is lost without JS */
    '<script>document.documentElement.classList.add(\'js\')</script>',
    ld ? jsonLd(ld) : ''
  ];
  return region('head', '\n' + lines.filter(Boolean).join('\n') + '\n');
}

/* The one-line gloss under each link in the phone menu sheet (copy deck §1). */
const NAV_GLOSS = {
  'work.html': 'The drawings, 2019 to 2025',
  'process.html': 'How a drawing is made',
  'projects.html': 'A chapel, a box, a floor, paper',
  'about.html': 'Her own account',
  'commissions.html': 'Commissions and collaborations'
};
function chromeRegion(file) {
  /* a drawing page belongs to Work */
  const current = href => href === file || (href === 'work.html' && file.startsWith('drawings/'));
  const links = NAV.map(n => '<a href="' + n.href + '"' + (current(n.href) ? ' aria-current="page"' : '') + '>' + n.label +
    (NAV_GLOSS[n.href] ? '<span class="gloss">' + NAV_GLOSS[n.href] + '</span>' : '') + '</a>').join('');
  return region('chrome',
    /* drawing pages carry <base href="../">, so the skip link names its own page (catalogue.js also handles it) */
    '<a class="skip-link" href="' + (file.startsWith('drawings/') ? file : '') + '#main">Skip to main content</a>' +
    '<header class="head"><a class="wm" href="index.html">' + STUDIO + '<span class="lab">' + ARTIST + '</span></a>' +
    '<button class="menu-toggle lab" type="button" aria-expanded="false" aria-controls="site-menu">Menu</button>' +
    '<nav id="site-menu" class="lab" aria-label="Site menu">' + links +
    '<p class="menu-foot"><a href="' + INSTAGRAM + '" rel="me noopener">Instagram</a> · <a href="' + LINKEDIN + '" rel="me noopener">LinkedIn</a></p></nav></header>');
}

/* The footer: a last invitation (copy deck §1). Pages that close with their own invitation
   (footer: 'short' in PAGES: Home's two doors, Process's "Watch your step") get only the last line. */
function footerRegion(p = {}) {
  if (p.footer === 'short') return region('footer', '<footer class="foot foot-short">' + footBase() + '</footer>');
  return region('footer',
    '<footer class="foot"><div class="foot-call"><h2 class="t">Watch your step.</h2><p class="lab">Her title for the City Mosses box, 2025</p></div>' +
    '<div class="foot-body"><p>' + ARTIST + ' works in India and London under the name ' + STUDIO + '. If you would like a drawing of a place you know, or have a room, a festival or a project in mind, write to her.</p>' +
    '<p class="foot-write"><a class="line" href="commissions.html">Write to her →</a></p></div>' +
    footBase() + '</footer>');
}
function footBase() {
  return '<div class="foot-base lab"><nav aria-label="Elsewhere"><a href="' + INSTAGRAM + '" rel="me noopener">Instagram @shilp_kalaa</a><span aria-hidden="true"> · </span><a href="' + LINKEDIN + '" rel="me noopener">LinkedIn</a></nav>' +
    '<p>Drawings © ' + ARTIST + '. Please ask before reproducing them.</p></div>';
}

function scriptsRegion(p) {
  const files = ['assets/works.js', 'assets/site.js', ...(p.js || [])];
  return region('scripts', '\n' + files.map(src => '<script src="' + src + '"></script>').join('\n') + '\n');
}

/* Apply head, chrome, footer and scripts to a page, migrating older pages that lack the markers. */
function applyShell(html, file, p, headBlock) {
  html = setRegion(html, 'head', headBlock, {
    legacy: /<!-- seo:[\s\S]*?<!-- \/seo -->/,
    insert: (h, b) => h.replace(/(<meta name="viewport"[^>]*>\n?)/, (m, v) => v + b + '\n')
  });
  html = stripLegacyHeadLinks(html);
  html = setRegion(html, 'chrome', chromeRegion(file), {
    legacy: /<header class="head">[\s\S]*?<\/header>/,
    insert: (h, b) => h.replace(/(<body[^>]*>\n?)/, (m, v) => v + b + '\n')
  });
  html = setRegion(html, 'footer', footerRegion(p), {
    legacy: /<footer class="foot[\s\S]*?<\/footer>/,
    insert: (h, b) => h.replace(/(<\/main>\n?)/, (m, v) => v + b + '\n')
  });
  html = setRegion(html, 'scripts', scriptsRegion(p), {
    legacy: /<script src="assets\/works\.js"><\/script>\s*<script src="assets\/site\.js"><\/script>/,
    insert: (h, b) => h.replace(/<\/body>/, () => b + '\n</body>')
  });
  /* the skip link needs a target */
  return html.replace(/<main(?![^>]*\bid=)/, '<main id="main"');
}

/* Font and stylesheet links left in <head> beside the generated region by older versions of the
   pages (they would load the fonts a second time, blocking). The region now carries them. */
const LEGACY_HEAD_LINE = /^\s*(<link rel="preconnect" href="https:\/\/fonts\.(googleapis|gstatic)\.com"[^>]*>|<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>|<link rel="stylesheet" href="assets\/site\.css">|<noscript><style>\.rv[^<]*<\/style><\/noscript>)\s*$/;
function stripLegacyHeadLinks(html) {
  const end = close('head');
  const from = html.indexOf(end);
  const to = html.indexOf('</head>');
  if (from < 0 || to < from) return html;
  const between = html.slice(from + end.length, to).split('\n').filter(line => !LEGACY_HEAD_LINE.test(line)).join('\n');
  return html.slice(0, from + end.length) + between + html.slice(to);
}

/* ---------- plate grids ---------- */
function plate(w) {
  return '<figure class="rv"><a href="' + drawingFile(w) + '"><div class="frame">' + picture(w.img, altOf(w)) + '</div>' +
    '<figcaption><b class="t">' + esc(w.title) + '</b><span class="lab">Pl. ' + plateNo(w) + ' · ' + w.year + '</span></figcaption></a></figure>';
}
const dataAttr = (tag, name) => {
  const m = tag.match(new RegExp(' data-' + name + '="([^"]*)"'));
  return m ? m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&') : '';
};
function seriesGrid(openTag) {
  const s = SK.series.find(x => x.id === dataAttr(openTag, 'plates'));
  if (!s) return null;
  const works = SK.works.filter(w => w.series === s.id);
  const limit = +dataAttr(openTag, 'limit');
  const shown = limit ? works.slice(0, limit) : works;
  return '<div class="series" id="' + s.id + '"><span class="lab">Series ' + pad(SK.series.indexOf(s) + 1) + '</span><h2 class="t">' + esc(s.title) + '</h2>' +
    '<span class="lab">' + esc(s.years) + ' · ' + works.length + (works.length === 1 ? ' plate' : ' plates') + '</span></div>' +
    (s.note ? '<p class="series-note">' + esc(s.note) + '</p>' : '') +
    '<div class="grid">' + shown.map(plate).join('') + '</div>' +
    (shown.length < works.length ? '<p class="more"><a class="line" href="work.html#' + s.id + '">All of ' + esc(s.title) + '</a></p>' : '');
}
function pickedGrid(openTag) {
  const shown = dataAttr(openTag, 'pick').split(',').map(id => SK.works.find(w => w.id === id.trim())).filter(Boolean);
  const years = SK.works.map(w => w.year);
  const note = dataAttr(openTag, 'note');
  return '<div class="series"><span class="lab">' + esc(dataAttr(openTag, 'label') || 'Selected') + '</span><h2 class="t">' + esc(dataAttr(openTag, 'title') || 'Selected drawings') + '</h2>' +
    '<span class="lab">' + Math.min(...years) + ' – ' + Math.max(...years) + ' · ' + SK.works.length + ' plates in all</span></div>' +
    (note ? '<p class="series-note">' + esc(note) + '</p>' : '') +
    '<div class="grid">' + shown.map(plate).join('') + '</div>' +
    '<p class="more"><a class="line" href="work.html">All the drawings, series by series</a></p>';
}
/* ---------- the Work catalogue: series strip + every series in justified rows ----------
   <section class="catalogue" data-catalogue></section> on work.html is filled with:
     nav.strip       sticky jump links, one per series (catalogue.js marks the series in view)
     section.sr      per series: title, "years · n drawings", note, then rows of plates
   Each plate is shown at the proportions of its drawn area (w.frame, else the whole image), and the
   plates of a series are broken into rows whose widths add up to about ROW_TARGET heights, so every
   row runs the full width at its own height: no uniform squares, no half-empty rows. Nothing here
   depends on a drawing's physical size. Phones regroup the same plates into two columns (CSS). */
const ROW_TARGET = 2.7;          /* sum of width/height ratios per row: about 360px tall at 1440 */
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi'];
function frameOf(w) {
  const info = imageInfo(w.img);
  const [x0, y0, x1, y1] = w.frame || [0, 0, 1, 1];
  return { x0, y0, fw: x1 - x0, fh: y1 - y0, r: ((x1 - x0) * info.width) / ((y1 - y0) * info.height) };
}
/* Split plates into rows: least squared distance of each row's ratio sum from the target. */
function rowsOf(works) {
  const r = works.map(w => frameOf(w).r), n = works.length;
  const best = [0], cut = [0];
  for (let j = 1; j <= n; j++) {
    best[j] = Infinity;
    for (let i = j - 1, sum = 0; i >= 0; i--) {
      sum += r[i];
      const cost = best[i] + Math.pow(sum - ROW_TARGET, 2);
      if (cost < best[j]) { best[j] = cost; cut[j] = i; }
      if (sum > ROW_TARGET * 1.8) break;
    }
  }
  const rows = [];
  for (let j = n; j > 0; j = cut[j]) rows.unshift(works.slice(cut[j], j));
  return rows;
}
/* A row with little in it (e.g. a series of two) would otherwise stretch its plates very large: cap its width
   so it stands no taller than 1.25 times a normal row. Rows that are nearly full stay full width. */
function rowCap(row) {
  const sum = row.reduce((t, w) => t + frameOf(w).r, 0);
  return sum < ROW_TARGET * 0.62 ? ' style="max-width:' + (100 * sum * 1.25 / ROW_TARGET).toFixed(1) + '%"' : '';
}
function catalogPlate(w) {
  const f = frameOf(w);
  const style = '--r:' + f.r.toFixed(3) + ';--fx:' + f.x0 + ';--fy:' + f.y0 + ';--fw:' + f.fw.toFixed(3) + ';--fh:' + f.fh.toFixed(3);
  return '<a class="pl" href="' + drawingFile(w) + '" style="' + style + '" aria-label="' + esc(w.title + ', ' + w.year + '. Open the drawing') + '">' +
    '<span class="pl-img">' + picture(w.img, altOf(w), { sizes: '(max-width:640px) 50vw, (max-width:1000px) 45vw, 33vw' }) + '</span>' +
    '<span class="pl-cap"><span class="pl-t">' + esc(w.title) + '</span><span class="pl-y lab">' + w.year + '</span><span class="pl-open lab" aria-hidden="true">Open</span></span></a>';
}
function catalogue() {
  const strip = '<nav class="strip lab" aria-label="Series"><ul>' +
    SK.series.map(s => '<li><a href="#' + s.id + '">' + esc(s.title) + '</a></li>').join('') + '</ul></nav>';
  const series = SK.series.map(s => {
    const works = SK.works.filter(w => w.series === s.id);
    if (!works.length) return '';
    return '<section class="sr" id="' + s.id + '" aria-labelledby="' + s.id + '-h"><header class="sr-head">' +
      '<h2 class="sh" id="' + s.id + '-h">' + esc(s.title) + '</h2>' +
      '<p class="lab">' + esc(s.years.replace(/\s*–\s*/, ' – ')) + ' · ' + works.length + (works.length === 1 ? ' drawing' : ' drawings') + '</p>' +
      (s.note ? '<p class="sr-note">' + esc(s.note) + '</p>' : '') + '</header>' +
      '<div class="rows">' + rowsOf(works).map(row => '<div class="prow"' + rowCap(row) + '>' + row.map(catalogPlate).join('') + '</div>').join('') + '</div></section>';
  }).join('');
  return strip + series;
}

/* Hand-written <img src="images/…"> without dimensions, on pages that opt in (sizeImages: true in PAGES),
   become a full <picture> with width, height, srcset and lazy loading. Class and alt are kept;
   data-sizes="…" on the img overrides the default sizes. Already-sized images are left alone. */
function sizeImages(html) {
  return html.replace(/<img\b([^>]*)>/g, (tag, attrs) => {
    const src = attrs.match(/\bsrc="images\/([^"/]+)"/);
    if (!src || /\bwidth=/.test(attrs)) return tag;
    const get = name => { const m = attrs.match(new RegExp('\\b' + name + '="([^"]*)"')); return m ? m[1] : null; };
    const alt = (get('alt') || '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    return picture(src[1], alt, { cls: get('class') || '', sizes: get('data-sizes') || '(max-width:640px) 92vw, 50vw' });
  });
}

function fillGrids(html) {
  html = html.replace(/(<section class="catalogue" data-catalogue[^>]*>)[\s\S]*?(<\/section>\s*<!-- \/catalogue -->)/, (all, openTag, closeTag) => openTag + catalogue() + closeTag);
  return html.replace(/(<section class="plates" data-(plates|pick)="[^"]*"[^>]*>)[\s\S]*?(<\/section>)/g, (all, openTag, kind, closeTag) => {
    const inner = kind === 'plates' ? seriesGrid(openTag) : pickedGrid(openTag);
    return inner === null ? all : openTag + inner + closeTag;
  });
}

/* ---------- about: "In brief" and the questions ---------- */
function factsBlock() {
  return '<section class="cv rv">\n        <h2 class="lab">In brief</h2>\n        <dl>\n' +
    FACTS.map(([k, v]) => '          <dt class="lab">' + k + '</dt><dd>' + v + '</dd>').join('\n') + '\n        </dl>\n      </section>';
}
function questionsBlock() {
  /* closed by default: the questions are for search engines and for the reader who wants them */
  return '<details class="faq">\n        <summary><h2 class="lab">Questions people ask</h2></summary>\n' +
    FAQ.map(([q, a]) => '        <div><h3>' + esc(q) + '</h3><p>' + esc(a) + '</p></div>').join('\n') + '\n      </details>';
}
function fillAbout(html) {
  html = setRegion(html, 'facts', region('facts', '\n      ' + factsBlock() + '\n      '));
  html = setRegion(html, 'questions', region('questions', '\n      ' + questionsBlock() + '\n      '));
  /* older form of the page: one <!-- facts --> block holding both */
  return html.replace(/<!-- facts -->[\s\S]*?<!-- \/facts -->/, () => '<!-- facts -->\n      ' + factsBlock() + '\n\n      ' + questionsBlock() + '\n      <!-- /facts -->');
}

/* ---------- commissions: the Write page ----------
   The form is always shown, next to the direct routes (Instagram, LinkedIn).
   SK.formTo  where the form delivers (FormSubmit). Never written into any page: catalogue.js reads it from
              works.js at send time. Empty → the form says it is not connected yet and sends nothing.
   SK.email   her public address. Only when set does a visible mailto line join the direct routes. */
function fillContact(html) {
  const routes = '<div class="direct-routes" data-contact="routes"><p class="lab">Or write directly</p>' +
    '<p class="route-buttons"><a class="btn route" href="' + INSTAGRAM + '" rel="me noopener">Message on Instagram, @shilp_kalaa</a><a class="btn route" href="' + LINKEDIN + '" rel="me noopener">Message on LinkedIn</a></p>' +
    (SK.email ? '<p class="write-direct">Or write straight to <a class="line" href="mailto:' + esc(SK.email) + '"><b>' + esc(SK.email) + '</b></a></p>' : '') + '</div>';
  html = setRegion(html, 'contact', region('contact', '\n      ' + routes + '\n      '));
  /* the "Which drawing?" list: every drawing, by id */
  html = setRegion(html, 'drawing-options', region('drawing-options', '<option value="">Choose a drawing</option>' +
    SK.works.map(w => '<option value="' + w.id + '">' + esc(w.title + ', ' + w.year) + '</option>').join('')));
  /* nothing hides the form any more (older versions of the page carried `hidden`) */
  return html.replace(/<form\b[^>]*\bid="enquiry"[^>]*>/, tag => tag.replace(/\s+hidden(?=[\s>])/, ''));
}

/* =====================================================================================
   DRAWING PAGES: drawings/<id>.html, written whole. site.js only adds behaviour to this markup.
   ===================================================================================== */
const ZOOM_HINT = 'Double-click or pinch to go in';
const ZOOM_HINT_TOUCH = 'Pinch or tap a close look';     /* shown instead on touch screens (CSS: pointer: coarse) */

/* The three close looks, as buttons i / ii / iii. Written twice: beside the viewer on wide screens
   ("side") and directly under it on phones and tablets ("under"); CSS shows one. The line for the
   active look appears under the viewer (.look-note, filled by site.js). */
function looksList(w, where) {
  const looks = w.looks || [];
  if (!looks.length) return '';
  return '<div class="a-looks a-looks-' + where + '">' + (where === 'side' ? '<p class="lab">Close looks</p>' : '<p class="lab visually-hidden">Close looks</p>') +
    '<div class="a-looks-list">' +
    looks.map((l, n) => '<button type="button" data-look="' + n + '"><span class="lab">' + ROMAN[n] + '</span>' + esc(l.name) + '</button>').join('') + '</div></div>';
}

/* "Drawing / The patch": only for a work with a real field photograph of its subject (w.patch). */
function patchToggle(w) {
  if (!w.patch) return '';
  return '<div class="patch-toggle lab" role="group" aria-label="Show"><button type="button" data-patch="off" aria-pressed="true">Drawing</button><button type="button" data-patch="on" aria-pressed="false">The patch</button></div>';
}
function patchLayer(w) {
  if (!w.patch) return '';
  const b = w.patch.box || [0, 0, 1, 1];
  return '<div class="patch" hidden data-box="' + b.join(',') + '">' + picture(w.patch.img, w.patch.alt || '', { cls: '', sizes: SIZES.viewer }) + '</div>';
}

function drawingMain(w, i) {
  const n = SK.works.length;
  const prev = SK.works[(i + n - 1) % n];
  const next = SK.works[(i + 1) % n];
  const s = seriesOf(w);
  const sized = sizeShown(w);
  const zoomAttrs = ' data-looks="' + esc(JSON.stringify(w.looks || [])) + '"' + (sized ? ' data-mm="' + w.mm + '"' : '') + (w.hires ? ' data-hires="images/' + esc(w.hires) + '"' : '');
  return '<main id="main" class="a-piece piece" data-piece="' + w.id + '">' +
    '<div class="a-view" style="--ar:' + (imageInfo(w.img).width / imageInfo(w.img).height).toFixed(3) + '">' +
      '<p class="a-title-m t" aria-hidden="true">' + esc(w.title) + '</p>' +
      '<div class="zoom" tabindex="0" role="img" aria-label="' + esc(altOf(w)) + ' Zoomable." aria-describedby="zoom-hint"' + zoomAttrs + '>' +
        picture(w.img, altOf(w), { sizes: SIZES.viewer, priority: true }) + '</div>' +
      patchLayer(w) +
      (sized ? '<div class="scalebar lab"><i></i><span>1 cm</span></div>' : '') +
      '<div class="a-under">' +
        '<p class="look-note" aria-live="polite"></p>' +
        (w.patch ? '<p class="patch-cap" hidden>' + esc(w.patch.caption) + '</p>' : '') +
        '<p class="hint lab" id="zoom-hint"><span class="hint-fine">' + ZOOM_HINT + '</span><span class="hint-touch">' + ZOOM_HINT_TOUCH + '</span></p>' +
        '<div class="ctrl">' + patchToggle(w) + '<button type="button" data-zoom="out" aria-label="Zoom out">−</button><button type="button" data-zoom="in" aria-label="Zoom in">+</button><button type="button" class="step-back lab" data-zoom="reset">Step back</button></div>' +
      '</div>' +
    '</div>' +
    looksList(w, 'under') +
    '<aside class="a-data">' +
      '<div><p class="lab">Pl. ' + pad(i + 1) + '</p><h1 class="t">' + esc(w.title) + '</h1></div>' +
      (w.desc ? '<p class="a-desc">' + esc(w.desc) + '</p>' : '') +
      '<dl><dt class="lab">Artist</dt><dd><a href="about.html">' + ARTIST + '</a></dd>' +
      '<dt class="lab">Series</dt><dd><a href="work.html#' + w.series + '">' + esc(s.title) + '</a></dd>' +
      '<dt class="lab">Year</dt><dd>' + w.year + '</dd>' +
      '<dt class="lab">Medium</dt><dd>' + esc(w.medium || MEDIUM) + '</dd>' +
      (sized ? '<dt class="lab">Size</dt><dd>' + esc(w.size) + '</dd>' : '') + '</dl>' +
      looksList(w, 'side') +
      '<div class="a-end"><a class="line" href="commissions.html?kind=existing&amp;about=' + encodeURIComponent(w.id) + '">Ask about this drawing →</a>' +
      '<nav class="a-nav lab" aria-label="More drawings"><a href="' + drawingFile(prev) + '" rel="prev">← Previous</a><a href="work.html#' + w.series + '">All drawings</a><a href="' + drawingFile(next) + '" rel="next">Next →</a></nav></div>' +
    '</aside></main>';
}

/* A page written whole by the build (drawing pages, piece.html). */
function wholePage(file, p, headBlock, main, { base = false } = {}) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' + (base ? '<base href="../">\n' : '') +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' + headBlock + '\n</head>\n<body>\n' +
    chromeRegion(file) + '\n\n' + main + '\n\n' + footerRegion(p) + '\n' + scriptsRegion(p) + '\n</body>\n</html>\n';
}

function drawingPage(w, i) {
  const file = drawingFile(w);
  const s = seriesOf(w);
  const p = { title: drawingTitle(w), desc: drawingDesc(w, s), ...CATALOGUE };
  const head = headRegion(file, p, { ld: LD.drawing(file, p, w), image: w.img, imageAlt: altOf(w), ogType: 'article' });
  return wholePage(file, p, head, drawingMain(w, i), { base: true });
}

/* piece.html was the old address of every drawing (piece.html?id=canopy). site.js forwards it. */
function piecePage() {
  const main = '<main id="main" class="page lost" data-forward>\n  <p class="lab">This address has moved</p>\n  <h1 class="lede">The drawing now has a page of its own.</h1>\n  <p><a class="line" href="work.html">All the drawings</a></p>\n</main>';
  return wholePage('piece.html', PIECE, headRegion('piece.html', PIECE), main);
}

/* =====================================================================================
   SITEMAP, ROBOTS, LLMS.TXT
   ===================================================================================== */
function sitemap() {
  /* no <lastmod>: the build cannot know when a page's content truly changed */
  const urls = Object.entries(PAGES).filter(([, p]) => !p.noindex).map(([file, p]) => [file, p.sitemapImages || []])
    .concat(SK.works.map(w => [drawingFile(w), [w.img]]));
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
    urls.map(([file, imgs]) => '  <url><loc>' + pageUrl(file) + '</loc>' + imgs.map(i => '<image:image><image:loc>' + SITE + 'images/' + i + '</image:loc></image:image>').join('') + '</url>').join('\n') +
    '\n</urlset>\n';
}
function robots() {
  return '# Everyone is welcome, search engines and AI assistants included.\nUser-agent: *\nAllow: /\n\n' +
    AI_AND_SEARCH_BOTS.map(b => 'User-agent: ' + b + '\nAllow: /\n').join('\n') + '\nSitemap: ' + SITE + 'sitemap.xml\n';
}
function llms() {
  const plain = v => v.replace(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g, (m, href, text) => text + ' (' + (/^http/.test(href) ? href : SITE + href) + ')');
  return '# ' + STUDIO + ' · ' + ARTIST + '\n\n> ' + SUMMARY + '\n\n' + LLMS_INTRO + '\n\n' +
    '## Facts\n\n' + FACTS.map(([k, v]) => '- ' + k + ': ' + plain(v)).join('\n') + '\n\n' +
    '## Questions\n\n' + FAQ.map(([q, a]) => '### ' + q + '\n' + a).join('\n\n') + '\n\n' +
    '## Pages\n\n' + LLMS_PAGES.map(([name, file, what]) => '- [' + name + '](' + SITE + file + '): ' + what).join('\n') + '\n\n' +
    '## Drawings\n\n' + SK.works.map(w => '- [' + w.title + '](' + SITE + drawingFile(w) + '): ' + (w.medium || MEDIUM).toLowerCase() + ', ' + w.year + ', series ' + seriesOf(w).title + (sizeShown(w) ? ', ' + w.size : '')).join('\n') + '\n';
}

/* =====================================================================================
   RUN
   ===================================================================================== */
function render() {
  const out = new Map();
  for (const [file, p] of Object.entries(PAGES)) {
    let html = read(file);
    html = applyShell(html, file, p, headRegion(file, p, { ld: p.ld ? LD[p.ld](file, p) : null, image: p.image }));
    html = fillGrids(html);
    if (p.sizeImages) html = sizeImages(html);
    if (file === 'about.html') html = fillAbout(html);
    if (file === 'commissions.html') html = fillContact(html);
    out.set(file, html);
  }
  SK.works.forEach((w, i) => out.set(drawingFile(w), drawingPage(w, i)));
  out.set('piece.html', piecePage());
  out.set('sitemap.xml', sitemap());
  out.set('robots.txt', robots());
  out.set('llms.txt', llms());
  return out;
}

/* Drawing pages left over from works that no longer exist (only files the build wrote). */
function staleDrawings(out) {
  if (!exists('drawings')) return [];
  return fs.readdirSync(path.join(ROOT, 'drawings'))
    .map(f => 'drawings/' + f)
    .filter(f => f.endsWith('.html') && !out.has(f) && read(f).includes(open('chrome')));
}

function writeAll(out) {
  const changed = [...out].filter(([file, text]) => !exists(file) || read(file) !== text);
  const stale = staleDrawings(out);
  if (!changed.length && !stale.length) return { changed: [], stale: [] };
  const stage = fs.mkdtempSync(path.join(ROOT, '.build-'));
  try {
    for (const [file, text] of changed) {
      const target = path.join(stage, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, text);
    }
    for (const [file] of changed) {
      fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
      fs.renameSync(path.join(stage, file), path.join(ROOT, file));
    }
    for (const file of stale) fs.rmSync(path.join(ROOT, file));
  } finally {
    fs.rmSync(stage, { recursive: true, force: true });
  }
  return { changed: changed.map(([f]) => f), stale };
}

/* Hand-written <img> tags without width/height (they make the page jump while loading).
   Prints the attributes to add; `node tools/build.js --img file.jpg "alt text" [class]` prints a whole tag. */
function warnImagesWithoutSize(out) {
  for (const [file, html] of out) {
    if (!file.endsWith('.html')) continue;
    for (const m of html.matchAll(/<img\b[^>]*\bsrc="(?:\.\.\/)?images\/([^"/]+)"[^>]*>/g)) {
      if (/\bwidth=/.test(m[0]) && /\bheight=/.test(m[0])) continue;
      let hint = '';
      try { const i = imageInfo(m[1]); hint = ' → add width="' + i.width + '" height="' + i.height + '"'; } catch (e) { hint = ' (image not found)'; }
      console.warn('  note: ' + file + ': <img src="images/' + m[1] + '"> has no width/height' + hint);
    }
  }
}

function main() {
  const flag = process.argv.indexOf('--img');
  if (flag > 0) {
    const file = process.argv[flag + 1], alt = process.argv[flag + 2] || '';
    console.log(picture(file, alt, { cls: process.argv[flag + 3] || '', sizes: '(max-width:640px) 100vw, 50vw' }));
    return;
  }
  validate();
  if (!SK.formTo) console.warn('  warning: Write form has no destination: set SK.formTo in assets/works.js before publishing');
  const output = render();
  warnImagesWithoutSize(output);
  const { changed, stale } = writeAll(output);
  console.log('Built for ' + SITE + ' · ' + Object.keys(PAGES).length + ' pages, ' + SK.works.length + ' drawing pages. ' +
    (changed.length ? 'Changed: ' + changed.join(', ') : 'Nothing changed') + (stale.length ? '. Removed: ' + stale.join(', ') : '') + '.');
}

try {
  main();
} catch (e) {
  console.error('Build stopped, nothing was written.\n' + e.message);
  process.exitCode = 1;
}
