# Shilp Kalaa · website

A plain HTML, CSS and JavaScript site for Shubhangi Saxena's drawings. Open `index.html` in a browser, or upload the folder to any static host.

**After changing `assets/works.js`, run `node tools/build.js`.** It needs no packages. It rewrites the parts that search engines and AI assistants read: each page's title and description, one page per drawing in `drawings/`, `sitemap.xml`, `robots.txt` and `llms.txt`.

## Files

| File | What it is |
|---|---|
| `index.html` | Home |
| `work.html` | All series, plus the "Seen on walks" photographs |
| `drawings/*.html` | One page per drawing, written by the build. Do not edit by hand |
| `piece.html` | The template those pages are made from |
| `tools/build.js` | The build. Page titles, descriptions, the "In brief" facts and the questions on About are edited here |
| `sitemap.xml`, `robots.txt`, `llms.txt` | Written by the build, for search engines and AI assistants |
| `projects.html` | Projects, exhibitions and workshops |
| `about.html` | About and list of projects |
| `commissions.html` | Enquiry form |
| `assets/works.js` | **The content list**: series, drawings, form email, lettering |
| `assets/site.css` | All styling; colours and lettering are tokens at the top |
| `assets/site.js` | Zoom viewer, scale bar, grids, form |
| `images/` | All images |

## Common changes

**Add a drawing.** Put the image in `images/` and add one entry to `works` in `assets/works.js`. Then run `node tools/build.js` so it gets its own page.

**Replace an Instagram image with a high-resolution file.** Either overwrite the file in `images/`, or keep the small one and add `hires: 'name-large.jpg'` to the entry; the large file then loads only when a visitor zooms in.

**Set true sizes.** `mm` is the width of the sheet in millimetres and drives the scale bar. `size` is the text shown to visitors.

**Add guided close looks.** Add `looks: [{ name: 'The centre', x: 0.5, y: 0.5, s: 5 }]` to an entry. `x` and `y` run from 0 to 1 across the sheet; `s` is the zoom.

**Connect the form.** Put her address in `email` in `assets/works.js`. Enquiries are then sent through FormSubmit, which emails her once to confirm the address before delivering anything.

**Change the lettering.** Set `lettering` in `assets/works.js` to `serif`, `type`, `sharp`, `pen` or `cursive`.

## Still placeholder

Titles, series names, years, sizes and all page text are drafts until Shubhangi supplies the real ones. The images are Instagram exports and go soft when zoomed.

## Online

The site is published with GitHub Pages from the `main` branch of `yashalgo/shilp-kalaa`; pushing to `main` updates it. Its public address is set once, as `site` in `assets/works.js` (currently `https://shilpkalaa.com/`). If the address ever changes, change it there and run the build.

## Being found

Done in the site: page titles and descriptions, canonical addresses, sharing cards, structured data (artist, artworks, exhibition, questions), a sitemap with images, and open access for search and AI crawlers.

Still to do by hand, once the domain is live:

1. Google Search Console: add `https://shilpkalaa.com/`, verify, and submit `sitemap.xml`.
2. Bing Webmaster Tools: the same. Bing's index feeds ChatGPT search and Copilot.
3. Put `shilpkalaa.com` in the Instagram bio and on LinkedIn. Links from her own profiles are how search engines connect the site to her.
