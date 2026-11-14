/* Everything the site shows is listed here. To add a drawing: put the image in /images and add one entry to "works".
   Titles, sizes, years and series names below are PLACEHOLDERS until Shubhangi supplies the real ones.
   mm     = width of the sheet in millimetres (drives the true-size scale bar)
   hires  = optional larger file; it loads only when a visitor zooms in
   looks  = optional guided close looks: x and y are 0–1 across the sheet, s is the zoom */
window.SK = {
  email: '',            // address that receives commission enquiries; the form stays unconnected until this is filled in
  lettering: 'serif',   // serif | type | sharp | pen | cursive
  series: [
    { id: 'city-mosses', title: 'City Mosses', years: '2024 – 2025', note: 'Wild patches found in nobody\'s land. Cracks, kerbs, the corners no one tends.' },
    { id: 'whispers-on-bricks', title: 'Whispers on Bricks', years: '2025', note: 'Six months beside one boundary wall, listening to what settled where two bricks meet.' },
    { id: 'forest-floor', title: 'Forest Floor', years: '2021 – 2022', note: 'Before the pavements, the woods. Everything growing over everything else, and no one in charge.' },
    { id: 'garden-plans', title: 'Garden Plans', years: '2023', note: 'Gardens drawn from above, each bed and path set down like a line in a letter.' },
    { id: 'overgrown-houses', title: 'Overgrown Houses', years: '2019 – 2020', note: 'The earliest drawings. Houses the green has begun to take back, one creeper at a time.' }
  ],
  works: [
    { id: 'moss-pavement-crack', series: 'city-mosses', title: 'Moss, pavement crack', year: 2024, size: '21 × 21 cm', mm: 210, img: 'moss-radial.jpg',
      looks: [{ name: 'The centre', x: .46, y: .5, s: 5 }, { name: 'The reaching edge', x: .2, y: .2, s: 6 }, { name: 'The root', x: .47, y: .83, s: 6 }] },
    { id: 'crack-i', series: 'city-mosses', title: 'Crack, i', year: 2024, size: '21 × 21 cm', mm: 210, img: 'crack.jpg' },
    { id: 'cushions-fallen-leaf', series: 'city-mosses', title: 'Cushions with a fallen leaf', year: 2024, size: '21 × 21 cm', mm: 210, img: 'mounds-leaf.jpg' },
    { id: 'cushions', series: 'city-mosses', title: 'Cushions', year: 2024, size: '21 × 21 cm', mm: 210, img: 'mounds.jpg' },
    { id: 'disc', series: 'city-mosses', title: 'Disc', year: 2024, size: '21 × 21 cm', mm: 210, img: 'disc.jpg' },
    { id: 'fragment', series: 'city-mosses', title: 'Fragment', year: 2025, size: '21 × 26 cm', mm: 210, img: 'fragment.jpg' },

    { id: 'whispers-on-bricks-i', series: 'whispers-on-bricks', title: 'Whispers on Bricks, i', year: 2025, size: '21 × 26 cm', mm: 210, img: 'bricks-1.jpg',
      looks: [{ name: 'The bare joint', x: .6, y: .3, s: 4.5 }, { name: 'A cushion of moss', x: .78, y: .72, s: 5.5 }, { name: 'The dense field', x: .25, y: .5, s: 5.5 }] },
    { id: 'whispers-on-bricks-ii', series: 'whispers-on-bricks', title: 'Whispers on Bricks, ii', year: 2025, size: '21 × 26 cm', mm: 210, img: 'bricks-2.jpg' },
    { id: 'whispers-on-bricks-iii', series: 'whispers-on-bricks', title: 'Whispers on Bricks, iii', year: 2025, size: '21 × 26 cm', mm: 210, img: 'bricks-3.jpg' },

    { id: 'clearing', series: 'forest-floor', title: 'Clearing', year: 2022, size: '29.7 × 21 cm', mm: 297, img: 'forest.jpg',
      looks: [{ name: 'The undergrowth', x: .3, y: .62, s: 5 }, { name: 'Between the trunks', x: .55, y: .36, s: 5.5 }, { name: 'The far edge', x: .8, y: .56, s: 5.5 }] },
    { id: 'woodland', series: 'forest-floor', title: 'Woodland', year: 2021, size: '21 × 21 cm', mm: 210, img: 'woodland.jpg' },
    { id: 'canopy', series: 'forest-floor', title: 'Canopy', year: 2022, size: '21 × 21 cm', mm: 210, img: 'canopy.jpg' },
    { id: 'branches', series: 'forest-floor', title: 'Branches', year: 2022, size: '21 × 21 cm', mm: 210, img: 'branches.jpg' },

    { id: 'garden-plan-i', series: 'garden-plans', title: 'Garden plan, i', year: 2023, size: '21 × 21 cm', mm: 210, img: 'garden.jpg' },
    { id: 'garden-plan-ii', series: 'garden-plans', title: 'Garden plan, ii', year: 2023, size: '21 × 21 cm', mm: 210, img: 'garden-full.jpg' },

    { id: 'overgrown-house-i', series: 'overgrown-houses', title: 'Overgrown house, i', year: 2019, size: '21 × 21 cm', mm: 210, img: 'house.jpg' },
    { id: 'overgrown-house-ii', series: 'overgrown-houses', title: 'Overgrown house, ii', year: 2020, size: '21 × 21 cm', mm: 210, img: 'house-2.jpg' }
  ]
};
