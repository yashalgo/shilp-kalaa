# Shilp Kalaa · website

A plain HTML, CSS and JavaScript site for Shubhangi Saxena's drawings. It needs no server-side build: the generated files are committed, so GitHub Pages (or any static host) serves the folder as it is.

**After changing `assets/works.js`, an image, or a page's head: run**

```sh
python3 tools/images.py   # only when images were added or replaced (needs Pillow)
node tools/build.js       # always
```

The build checks the data first and writes nothing if something is wrong. A second run with no changes prints `Nothing changed`.

## Hand-written versus generated

Pages are hand-written HTML. The build writes only inside marked regions:

```html
<!-- generated: NAME · tools/build.js --> … <!-- /generated: NAME -->
```

Never edit inside a region; change its source in `tools/build.js` and run the build. Everything outside the regions is left exactly as it is.

| Region | Where | Comes from (`tools/build.js`) |
|---|---|---|
| `head` | every page, in `<head>` | `PAGES` (title, description, sharing image, extra `css`), `LD` (structured data), fonts, `site.css` |
| `chrome` | every page, top of `<body>` | skip link and header; navigation is the `NAV` list (one line per item) |
| `footer` | every page, after `<main>` | `footerRegion()` |
| `scripts` | every page, end of `<body>` | `works.js`, `site.js`, then the page's extra `js` |
| `facts`, `questions` | `about.html` (or the older single `<!-- facts -->` block) | `FACTS`, `FAQ` |
| `contact` | `commissions.html` | direct routes or a mailto, depending on `SK.email` |

Also generated: the plate grids inside `<section class="plates" data-plates="series-id">` and `<section class="plates" data-pick="id,id,…">` (optional `data-limit`, `data-label`, `data-title`, `data-note`); every `drawings/<id>.html` (whole file; template `drawingMain()`); `piece.html`; `sitemap.xml`, `robots.txt`, `llms.txt`.

The words used for search (titles, descriptions, summary, facts, questions, exhibition text) are constants at the top of `tools/build.js` under **THE WORDS** and **THE PAGES**.

## Common changes

**Add a page.** Create `name.html` with `<meta charset>`, `<meta name="viewport">`, and a `<main id="main">…</main>`. Add an entry to `PAGES` in `tools/build.js` (`title`, `desc`, `crumb`, `ld`, optional `css`/`js` arrays for page-only files). Add it to `NAV` if it belongs in the menu, and to `LLMS_PAGES`. Run the build: head, header, footer and scripts are inserted, and the page joins the sitemap.

**Add a drawing.** Put the image in `images/`, run `python3 tools/images.py`, add an entry to `works` in `assets/works.js`, run `node tools/build.js`. Its page, grid plate, sitemap entry, structured data and llms.txt line appear.

**Sizes (the size gate).** `size` and `mm` stay in the data but nothing shows them — no size line, no scale bar, no size in structured data or llms.txt — until the work has `sizeConfirmed: true`. The home hero's scale bar likewise needs `heroSizeConfirmed: true`.

**Close looks.** `looks: [{ name, note, x, y, s }]`: `x`, `y` are the centre from 0 to 1 across and down the drawing, `s` the zoom; `note` shows under the buttons while the look is active.

**Write page.** The form is always shown, beside the direct routes (Instagram, LinkedIn). It sends through FormSubmit to `formTo` in `assets/works.js`, which is never written into any page (FormSubmit emails that address once to confirm it). While `formTo` is empty the form sends nothing and tells the visitor it isn't connected yet, and `node tools/build.js` prints a warning. `email` is her public address: only when it is set does a visible mailto line join the direct routes. Links from a drawing (`commissions.html?kind=existing&about=<id>`) select "About an existing drawing" and show that drawing above the form; `?kind=commission` / `?kind=exhibition` bring the matching path forward. The behaviour is in `assets/catalogue.js`.

**Images in hand-written HTML.** Give every `<img>` its `width` and `height`. The build lists any that lack them, with the numbers to add; `node tools/build.js --img name.jpg "alt text" [class]` prints a complete responsive tag.

**Higher-resolution scans.** Replace the file in `images/` and re-run both scripts; only that image is regenerated. Or keep the small one and add `hires: 'name-large.jpg'` to the work: it loads only when a visitor zooms in.

**Lettering.** Set `lettering` in `assets/works.js` to `serif`, `type`, `sharp`, `pen` or `cursive`.

## Files

| File | What it is |
|---|---|
| `index.html`, `process.html`, `about.html` | Home, Process, About (hand-written inside `<main>`; story styles in `assets/story.css`, `assets/story.js`) |
| `work.html`, `projects.html`, `commissions.html`, `404.html` | Work, Projects, Write, the missing-page page |
| `drawings/*.html` | One page per drawing, written by the build. Do not edit |
| `piece.html` | Old drawing address; forwards `piece.html?id=x` to `drawings/x.html`. Written by the build |
| `assets/works.js` | **The content list**: series, drawings, email, lettering |
| `assets/site.css` | Shared styling; colours and lettering are tokens at the top |
| `assets/site.js` | Header and menu, zoom viewer, home hero, fade-in |
| `assets/catalogue.js` | Work series strip, the patch toggle, the Write form, the skip link on pages with `<base>` |
| `tools/build.js` | The build |
| `tools/images.py` | Responsive image derivatives → `images/generated/`, `images/manifest.json` |

## Online

Published with GitHub Pages from `main` of `yashalgo/shilp-kalaa`. The public address is `site` in `assets/works.js` (`https://shilpkalaa.com/`); if it changes, change it there and run the build.

## Being found

In the site: titles and descriptions, canonical addresses, sharing cards with image sizes, structured data (website, artist, pages, artworks with images, exhibition, book, commission service, questions, breadcrumbs), a sitemap with images, `robots.txt` welcoming search and AI crawlers, and `llms.txt`.

By hand, once the domain is live: submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools, and put `shilpkalaa.com` in the Instagram bio and on LinkedIn.
