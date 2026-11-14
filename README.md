# Shilp Kalaa · website

A plain HTML, CSS and JavaScript site for Shubhangi Saxena's drawings. There is no build step: open `index.html` in a browser, or upload the folder to any static host.

## Files

| File | What it is |
|---|---|
| `index.html` | Home |
| `work.html` | All series, plus the "Seen on walks" photographs |
| `piece.html` | One drawing with zoom, close looks and the scale bar (`piece.html?id=...`) |
| `projects.html` | Projects, exhibitions and workshops |
| `about.html` | About and list of projects |
| `commissions.html` | Enquiry form |
| `assets/works.js` | **The content list**: series, drawings, form email, lettering |
| `assets/site.css` | All styling; colours and lettering are tokens at the top |
| `assets/site.js` | Zoom viewer, scale bar, grids, form |
| `images/` | All images |

## Common changes

**Add a drawing.** Put the image in `images/` and add one entry to `works` in `assets/works.js`. It appears on the Work page and gets its own page.

**Replace an Instagram image with a high-resolution file.** Either overwrite the file in `images/`, or keep the small one and add `hires: 'name-large.jpg'` to the entry; the large file then loads only when a visitor zooms in.

**Set true sizes.** `mm` is the width of the sheet in millimetres and drives the scale bar. `size` is the text shown to visitors.

**Add guided close looks.** Add `looks: [{ name: 'The centre', x: 0.5, y: 0.5, s: 5 }]` to an entry. `x` and `y` run from 0 to 1 across the sheet; `s` is the zoom.

**Connect the form.** Put her address in `email` in `assets/works.js`. Enquiries are then sent through FormSubmit, which emails her once to confirm the address before delivering anything.

**Change the lettering.** Set `lettering` in `assets/works.js` to `serif`, `type`, `sharp`, `pen` or `cursive`.

## Still placeholder

Titles, series names, years, sizes and all page text are drafts until Shubhangi supplies the real ones. The images are Instagram exports and go soft when zoomed.

## Putting it online

Upload the whole folder, except `.superpowers/`, to a free static host such as Netlify, Cloudflare Pages or GitHub Pages. No settings are needed.
