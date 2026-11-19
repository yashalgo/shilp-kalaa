/* Everything the site shows is listed here. To add a drawing: put the image in /images, run python3 tools/images.py,
   add one entry to "works" and run node tools/build.js.
   Titles are PLACEHOLDERS (plain descriptions) until Shubhangi names the drawings herself. Years are the year each drawing was first shared.
   series  = series are listed newest first; works keep the order given here within their series
   desc    = what is visibly in the drawing (copy deck §5.2); alt = alt text for the image
   medium  = only where it differs from the default "Pen and ink on paper"
   size, mm, sizeConfirmed = only when the real size is known: size as written ('21 × 29.7 cm'), mm = width of the sheet in
             millimetres, and sizeConfirmed: true. Without all three nothing shows a size anywhere. No sizes are known yet.
   frame   = [left, top, right, bottom] as 0–1 of the image: the drawn area, so the Work grid shows each drawing at its own
             proportions without the photo's empty margins (found by tools-free ink detection; omit to show the whole image)
   hires   = optional larger file; it loads only when a visitor zooms in
   looks   = three guided close looks: name, the line shown while the look is active, x and y = centre of the look as 0–1 across
             and down the image, s = zoom (the view shows 1/s of the sheet's width)
   patch   = a field photograph of the drawing's subject: img, alt, caption, and box = [left, top, width, height] as 0–1 of the
             drawing, the area the photograph covers once registered onto it */
window.SK = {
  site: 'https://shilpkalaa.com/',   // public address; tools/build.js writes it into every page
  email: 'studio@shilpkalaa.com',            // her PUBLIC address: only this is ever shown (mailto line, structured data). Empty until she gives one
  formTo: 'studio@shilpkalaa.com',   // where the Write form delivers (FormSubmit address or alias). NEVER shown on the site; empty = form not connected
  heroSizeConfirmed: false,
  lettering: 'serif',   // serif | type | sharp | pen | cursive
  series: [
    { id: 'whispers-on-bricks', title: 'Whispers on Bricks', years: '2025', note: 'Mosses sitting on top of two bricks of one boundary wall. Shown in KaalChakra, a group exhibition by OSA studio for London Design Festival 2025, at Asylum Chapel, London, 14–15 September 2025.' },
    { id: 'city-mosses', title: 'City Mosses', years: '2024 – 2025', note: 'In her words, “the wild patches of plant species, found in nobody’s land”: paving joints, a split slab, moss cushions. Some are drawn on paper she made with moss in it.' },
    { id: 'garden-plans', title: 'Garden Plans', years: '2023', note: 'Gardens seen from above: a winding path, beds of flowers, trees drawn as rings of marks. Shown with a site plan and a tracing of contours.' },
    { id: 'forest-floor', title: 'Forest Floor', years: '2021 – 2022', note: 'Before the pavements, the woods: undergrowth, boulders and canopy drawn so densely that the trees are left as white paper.' },
    { id: 'overgrown-houses', title: 'Overgrown Houses', years: '2019 – 2020', note: 'The early drawings: houses and shopfronts drawn window by window and brick by brick, while creepers, palms and potted plants take over the fronts.' }
  ],
  works: [
    /* ── Whispers on Bricks ── */
    { id: 'whispers-on-bricks-i', series: 'whispers-on-bricks', title: 'Whispers on Bricks, i', year: 2025, img: 'bricks-1.jpg', frame: [0, 0.039, 0.911, 0.949],
      desc: 'On the left, one solid mat of feathery moss. In the middle runs a narrow pale joint, drawn in fine dots. On the right is bare brick, with separate small cushions, rosettes and flowers dotted across it.',
      alt: 'Ink drawing of moss on two bricks: a dense mat of feathery moss on the left, a pale joint down the middle, and scattered moss cushions and small plants on the right.',
      looks: [
        { name: 'The joint', note: 'The pale band where the two bricks meet, all in dots.', x: .54, y: .27, s: 4 },
        { name: 'A cushion', note: 'A round cushion with star-like tips.', x: .71, y: .64, s: 3.6 },
        { name: 'The mat', note: 'Feathery fronds packed edge to edge.', x: .24, y: .45, s: 3.6 }] },
    { id: 'whispers-on-bricks-ii', series: 'whispers-on-bricks', title: 'Whispers on Bricks, ii', year: 2025, img: 'bricks-2.jpg', frame: [0, 0.039, 1, 0.949],
      desc: 'A wide field of moss with almost no paper left. Feathery fronds cover the upper right and darker ground the left, with rounder cushions in between. A few pale pebbles and a curled white leaf lie near the bottom.',
      alt: 'Ink drawing of a dense field of moss: feathery fronds at the upper right, two round cushions in the middle, and a few pale pebbles and a white leaf near the bottom.',
      looks: [
        { name: 'Pebbles', note: 'Small stones left as blank paper.', x: .39, y: .42, s: 4 },
        { name: 'Two cushions', note: 'One dark and fine, one with leaves radiating from its middle.', x: .6, y: .63, s: 2.6 },
        { name: 'The curled leaf', note: 'A pale leaf lying on the moss.', x: .22, y: .85, s: 4 }] },
    { id: 'whispers-on-bricks-iii', series: 'whispers-on-bricks', title: 'Whispers on Bricks, iii', year: 2025, img: 'bricks-3.jpg', frame: [0.103, 0.057, 1, 0.949],
      desc: 'Moss cushions on dark ground. A long pale twig crosses the left half on a diagonal, and fallen leaves, left white, lie on the moss around it. At the lower right a bright, stippled patch holds one more leaf.',
      alt: 'Ink drawing of moss cushions on dark ground, with a long pale twig crossing diagonally and several pale leaves lying on the moss.',
      looks: [
        { name: 'The twig', note: 'A pale line drawn by leaving the paper bare.', x: .48, y: .5, s: 2.6 },
        { name: 'Fallen leaves', note: 'Leaves left white on the moss.', x: .26, y: .5, s: 3 },
        { name: 'The bright patch', note: 'Light stipple around a single leaf.', x: .83, y: .62, s: 3.6 }] },

    /* ── City Mosses ── */
    { id: 'moss-pavement-crack', series: 'city-mosses', title: 'From a pavement crack', year: 2024, img: 'moss-radial.jpg', frame: [0.122, 0.094, 0.844, 0.911],
      desc: 'A low creeping plant drawn from above. Its thin stems spread out from one dense knot, each tiny leaf outlined in pen. At the bottom the stems gather into a narrow bundle where the plant comes up out of the paving, and at the top left one long runner wanders off on its own.',
      alt: 'Pen and ink drawing of a creeping plant seen from above, with hundreds of thin stems and small leaves spreading from a dense centre and one long runner at the top left.',
      looks: [
        { name: 'The knot', note: 'The stems cross so thickly here that the paper almost disappears.', x: .46, y: .47, s: 5 },
        { name: 'The runner', note: 'One stem with paired leaves, out on its own.', x: .21, y: .24, s: 4 },
        { name: 'The base', note: 'The stems bunch into one shaded bundle.', x: .45, y: .82, s: 4.5 }],
      patch: { img: 'pair-photo.jpg', alt: 'Her photograph: a small plant spreading from a crack between paving slabs',
        caption: 'Her photograph of the plant, in a split paving slab. 2024.', box: [.1806, .1333, .759, .7583] } },
    { id: 'crack-i', series: 'city-mosses', title: 'Crack, i', year: 2024, img: 'crack.jpg', frame: [0.293, 0.039, 0.696, 0.933],
      desc: 'One split in the paving, drawn top to bottom as a narrow ribbon of moss and grit. It swells in the middle and pinches at both ends. A few loose crumbs drift off to the right, and at the very top two pale seedling leaves open against the dark.',
      alt: 'Ink drawing of a long, narrow crack filled with moss, running down the middle of white paper, widest at its centre, with small specks scattered to the right.',
      looks: [
        { name: 'Two seed leaves', note: 'A pair of rounded leaves left in clean outline.', x: .5, y: .1, s: 6 },
        { name: 'The swell', note: 'The moss thickens into dense clusters dotted with small white circles.', x: .47, y: .5, s: 4 },
        { name: 'Stray crumbs', note: 'Separate tiny clumps adrift on the paper.', x: .59, y: .37, s: 5 }] },
    { id: 'cushions-fallen-leaf', series: 'city-mosses', title: 'Cushions with a fallen leaf', year: 2024, img: 'mounds-leaf.jpg',
      desc: 'Rounded cushions of moss crowd the sheet, each built from short, spiky leaves. A pale fallen leaf, folded along its midrib, lies across them, drawn in only a few long lines. Lower down, one cushion is made entirely of dots.',
      alt: 'Ink drawing of rounded moss cushions seen from above, with a large pale fallen leaf lying across them right of centre.',
      looks: [
        { name: 'The fallen leaf', note: 'A whole leaf in a handful of lines, against the busiest part of the moss.', x: .62, y: .47, s: 2.2 },
        { name: 'The dotted cushion', note: 'Stipple instead of strokes.', x: .72, y: .85, s: 3.6 },
        { name: 'The white channels', note: 'Bare paper running between the cushions.', x: .36, y: .6, s: 2.4 }] },
    { id: 'cushions', series: 'city-mosses', title: 'Cushions', year: 2024, img: 'mounds.jpg',
      desc: 'A close view of a few moss cushions. A large round one in the middle is made of small star-shaped tufts, a dotted one is cut off at the left edge, and a fringe of longer, hairier growth runs along the bottom.',
      alt: 'Ink drawing of round moss cushions: a large one in the centre made of tiny star-shaped tufts, and a stippled one at the left edge.',
      looks: [
        { name: 'Stars', note: 'Each tuft is a small star of strokes.', x: .5, y: .46, s: 3.2 },
        { name: 'Stipple', note: 'The same kind of cushion, made of dots.', x: .14, y: .33, s: 3.6 },
        { name: 'The fringe', note: 'Long hairs standing up into the white.', x: .62, y: .8, s: 3.2 }] },
    { id: 'disc', series: 'city-mosses', title: 'Disc', year: 2024, img: 'disc.jpg', frame: [0.154, 0.151, 0.838, 0.853],
      medium: 'Pen and ink on handmade paper made with moss',
      desc: 'Drawn on a round sheet of handmade paper with moss in the pulp. Moss cushions of different textures crowd together, with a few thin stems across them and pale leaves left in outline. Smaller cushions scatter towards the rough edge of the sheet.',
      alt: 'Ink drawing of clustered moss cushions on a round sheet of green-flecked handmade paper with a rough edge, with a few pale leaves among the moss.',
      looks: [
        { name: 'A pale leaf', note: 'A four-part leaf left blank among the darkest moss.', x: .42, y: .34, s: 4 },
        { name: 'The paper itself', note: 'The green flecks of moss in the sheet and its uneven edge.', x: .71, y: .69, s: 3.6 },
        { name: 'Crossing stems', note: 'Thin stems drawn over the top of the cushions.', x: .32, y: .53, s: 3.6 }] },
    { id: 'fragment', series: 'city-mosses', title: 'Fragment', year: 2025, img: 'fragment.jpg', frame: [0.269, 0.173, 0.764, 0.829],
      desc: 'A tall upright panel from the City Mosses box. Dense black moss fills the middle. Above it the marks break into scattered specks, below it rounded leaves are left as white outlines, and a spray of thin stems crosses the centre right.',
      alt: 'High-contrast ink image of moss in an upright panel: dense black in the middle, scattered specks above, white outlined leaves below, and a spray of thin stems at centre right.',
      looks: [
        { name: 'The scatter', note: 'The moss thins into separate specks.', x: .5, y: .28, s: 3.2 },
        { name: 'The spray', note: 'Thin curving stems fanning out from one point.', x: .6, y: .54, s: 3.6 },
        { name: 'White leaves', note: 'Round leaves drawn only as outlines.', x: .46, y: .68, s: 3.2 }] },

    /* ── Garden Plans ── */
    { id: 'garden-plan-i', series: 'garden-plans', title: 'Garden plan, i', year: 2023, img: 'garden.jpg',
      desc: 'A close view of a garden from above. A pale winding path is drawn in flowing lines, beds of small flowers run along either side, and the trees appear as round rings of marks.',
      alt: 'Ink drawing of a garden seen from above: a pale winding path, dark beds of small flowers, and trees drawn as round rings.',
      looks: [
        { name: 'The path', note: 'Long curving strokes, like water.', x: .45, y: .64, s: 2.4 },
        { name: 'Tree crowns', note: 'Round wheels of marks.', x: .84, y: .6, s: 3.2 },
        { name: 'A flower bed', note: 'A dark bed scattered with white star flowers.', x: .33, y: .36, s: 3.2 }] },
    { id: 'garden-plan-ii', series: 'garden-plans', title: 'Garden plan, ii', year: 2023, img: 'garden-full.jpg', frame: [0.222, 0.014, 0.75, 0.975],
      desc: 'A whole garden from above, in a tall rectangle. One path snakes from top to bottom between curving beds, and trees drawn as circles line the border.',
      alt: 'Ink drawing of a whole garden plan in a tall rectangle: a winding path from top to bottom between curving beds, bordered by trees drawn as circles.',
      looks: [
        { name: 'Where the path begins', note: 'The path opens into a rounded pool of lines.', x: .45, y: .2, s: 4 },
        { name: 'Curving beds', note: 'Dark beds wrapping around the path.', x: .45, y: .5, s: 3 },
        { name: 'The tree border', note: 'Trees as circles, each one different inside.', x: .33, y: .56, s: 4 }] },

    /* ── Forest Floor ── */
    { id: 'clearing', series: 'forest-floor', title: 'Clearing', year: 2022, img: 'forest.jpg', frame: [0, 0.15, 1, 0.85],
      desc: 'A wooded slope in a wide format. Trees with white, branching trunks stand among grasses, spiky plants and pale boulders, and a band of tall grass and small flowers runs along the bottom.',
      alt: 'Wide ink drawing of a wooded slope: trees with white branching trunks, dense shrubs, pale boulders, and a band of tall grass and small flowers along the bottom.',
      looks: [
        { name: 'The white trees', note: 'Trunks and branches that are uninked paper.', x: .14, y: .52, s: 3.6 },
        { name: 'Boulders', note: 'Pale rounded stones half-hidden in the shrubs.', x: .84, y: .53, s: 4.5 },
        { name: 'The meadow', note: 'Grass blades and small white flowers.', x: .5, y: .72, s: 3.6 }] },
    { id: 'woodland', series: 'forest-floor', title: 'Woodland', year: 2021, img: 'woodland.jpg', frame: [0.086, 0, 0.922, 1],
      desc: 'An upright view into a wood. A slender white tree stands in front of layered undergrowth, two white branching shapes sit in the middle distance, and large star-shaped leaves fill the foreground.',
      alt: 'Upright ink drawing of woodland: a slender white tree in front of layered undergrowth, with large star-shaped leaves in the foreground.',
      looks: [
        { name: 'The trunk', note: 'A tree drawn by leaving it out.', x: .35, y: .5, s: 3 },
        { name: 'The stippled bank', note: 'A grassy rise made of dots.', x: .6, y: .53, s: 3.6 },
        { name: 'The front row', note: 'Big star-shaped leaves outlined in white.', x: .5, y: .81, s: 2.6 }] },
    { id: 'canopy', series: 'forest-floor', title: 'Canopy', year: 2022, img: 'canopy.jpg', frame: [0.075, 0, 0.906, 1],
      desc: 'Islands of dense leaves separated by white channels that branch like limbs. Every leaf is a small fan of strokes, and the white between them does the work of the branches.',
      alt: 'Upright ink drawing of dense leaf masses broken by branching white channels, like a canopy with the branches left as bare paper.',
      looks: [
        { name: 'The long island', note: 'One tall mass of leaves.', x: .48, y: .38, s: 2.4 },
        { name: 'Where the white branches', note: 'The channels split and narrow.', x: .72, y: .3, s: 3.6 },
        { name: 'Leaf by leaf', note: 'Each leaf is a small fan of lines.', x: .22, y: .8, s: 4 }] },
    { id: 'branches', series: 'forest-floor', title: 'Branches', year: 2022, img: 'branches.jpg', frame: [0, 0.094, 1, 1],
      desc: 'One tree fills the sheet. Its white trunk and branches run up through a dense mesh of small leaves, and pale boulders and smaller plants gather at the lower right.',
      alt: 'Ink drawing of a single large tree with a white trunk and branches spreading through a dense mesh of leaves, with pale boulders at the lower right.',
      looks: [
        { name: 'The trunk', note: 'Where the white limbs start.', x: .44, y: .85, s: 3 },
        { name: 'The fine branching', note: 'Branches thinning to threads.', x: .5, y: .27, s: 3.6 },
        { name: 'Boulders', note: 'Two pale stones among the shrubs.', x: .8, y: .8, s: 3 }] },

    /* ── Overgrown Houses ── */
    { id: 'overgrown-house-i', series: 'overgrown-houses', title: 'Overgrown house, i', year: 2019, img: 'house.jpg', frame: [0.049, 0, 0.936, 1],
      desc: 'A narrow three-storey building of brick and stone with lattice windows, a tiled roof over one side and shopfronts below. Creepers spill over the parapet, a tree climbs the right side, and a ladder leans by the open door.',
      alt: 'Pen and ink drawing of a narrow three-storey brick house with lattice windows, creepers spilling over the roof and a tree climbing its right side.',
      looks: [
        { name: 'The parapet', note: 'Plants spilling over the roof edge.', x: .22, y: .14, s: 3.4 },
        { name: 'Ladder and door', note: 'A ladder leaning by the half-open door.', x: .37, y: .87, s: 3.4 },
        { name: 'The climbing tree', note: 'Leaves drawn as small fans.', x: .75, y: .57, s: 3 }] },
    { id: 'overgrown-house-ii', series: 'overgrown-houses', title: 'Overgrown house, ii', year: 2019, img: 'house-2.jpg', frame: [0.031, 0, 0.955, 0.996],
      desc: 'Two ramshackle houses joined together, with palms and shrubs growing on the roof and a ladder up to the top. Washing hangs from the windows, and an awning, a stall and two cartwheels fill the street front.',
      alt: 'Pen and ink drawing of two ramshackle joined houses with palms growing on the roof, washing at the windows and a stall with an awning at street level.',
      looks: [
        { name: 'The roof garden', note: 'Palms and shrubs where the roof should be.', x: .45, y: .19, s: 2.4 },
        { name: 'Washing', note: 'Clothes hung from the windows.', x: .36, y: .53, s: 3.4 },
        { name: 'The street', note: 'The awning, the stall and the wheels.', x: .74, y: .82, s: 2.8 }] },
    { id: 'overgrown-house-iii', series: 'overgrown-houses', title: 'Timber-framed cottage', year: 2019, img: 'house-03.jpg', frame: [0.023, 0, 0.999, 1],
      desc: 'A small timber-framed cottage with a steep tiled roof and diamond-paned windows, with shrubs and an iron railing at its feet on a paved forecourt.',
      alt: 'Pen and ink drawing of a small timber-framed cottage with a steep tiled roof, diamond-paned windows and shrubs by a railing.',
      looks: [
        { name: 'The roof', note: 'Every tile drawn.', x: .48, y: .2, s: 3 },
        { name: 'Diamond panes', note: 'The leaded windows.', x: .49, y: .42, s: 2.4 },
        { name: 'The railing', note: 'Ironwork among shrubs.', x: .71, y: .82, s: 3 }] },
    { id: 'overgrown-house-iv', series: 'overgrown-houses', title: 'Ivy house', year: 2019, img: 'house-07.jpg', frame: [0.118, 0, 0.938, 1],
      desc: 'A narrow house almost covered in ivy, with a flag on the roof, a gate and steps at the front, and a bare tree beside it.',
      alt: 'Pen and ink drawing of a narrow house almost covered in ivy, with a flag on the roof and a bare tree beside it.',
      looks: [
        { name: 'The flag', note: 'A small flag on the roof, the one thing up there the ivy has not reached.', x: .31, y: .13, s: 4 },
        { name: 'Windows in the ivy', note: 'Where the leaves part.', x: .46, y: .33, s: 2.6 },
        { name: 'The bare tree', note: 'Branches without leaves.', x: .74, y: .58, s: 2.8 }] },
    { id: 'overgrown-house-v', series: 'overgrown-houses', title: 'Shop with a handcart', year: 2019, img: 'house-15.jpg', frame: [0, 0.013, 1, 0.911],
      desc: 'A low shack hung with washing and goods, with a palm on one side and a handcart and chairs in front.',
      alt: 'Pen and ink drawing of a low shack hung with washing and goods, a palm tree beside it and a handcart in front.',
      looks: [
        { name: 'The palm', note: 'A palm drawn frond by frond, leaning out over the roof.', x: .2, y: .26, s: 3 },
        { name: 'Washing', note: 'Cloth hung along the front.', x: .5, y: .6, s: 3 },
        { name: 'The handcart', note: 'Its wheels and shafts.', x: .23, y: .74, s: 2.8 }] },
    { id: 'overgrown-house-vi', series: 'overgrown-houses', title: 'Clock tower', year: 2020, img: 'house-11.jpg',
      desc: 'A brick building with three clock faces and a pointed tower, thick with plants around its arched entrance and steps.',
      alt: 'Pen and ink drawing of a brick building with three clock faces and a pointed tower, with plants growing thickly around an arched entrance.',
      looks: [
        { name: 'Three clocks', note: 'Three clock faces, each drawn differently: one with a three-pointed star, two with numerals.', x: .6, y: .38, s: 1.5 },
        { name: 'The arch', note: 'Steps going in.', x: .6, y: .86, s: 3 },
        { name: 'The planting', note: 'Leaves pressing against the brick.', x: .2, y: .82, s: 3 }] },
    { id: 'overgrown-house-vii', series: 'overgrown-houses', title: 'Stacked house', year: 2020, img: 'house-12.jpg', frame: [0.12, 0.06, 0.93, 1],
      desc: 'Rooms stacked one on another in a tall, leaning tower of planks and corrugated sheet, with a wooden pole strung with wires and plants alongside. Signed at the lower right.',
      alt: 'Pen and ink drawing of a tall leaning tower of stacked rooms made of planks and corrugated sheet, with a wooden pole and plants beside it.',
      looks: [
        { name: 'The top room', note: 'A boxy room perched on the roofs below, with potted plants along its edge.', x: .42, y: .2, s: 3 },
        { name: 'The pole', note: 'A wooden pole strung with wires, with a cloth and a sign hanging from it.', x: .74, y: .44, s: 3 },
        { name: 'The ground floor', note: 'Plants and a doorway.', x: .38, y: .72, s: 2.6 }] },
    { id: 'overgrown-house-viii', series: 'overgrown-houses', title: 'Treehouse', year: 2020, img: 'house-14.jpg', frame: [0.097, 0.054, 0.922, 0.992],
      desc: 'A treehouse built around a trunk, with a ladder, a hanging basket and potted plants crowding its deck. Signed at the lower right.',
      alt: 'Pen and ink drawing of a treehouse built around a trunk, with a ladder, a hanging basket and potted plants on its deck.',
      looks: [
        { name: 'The deck', note: 'Pots and railings.', x: .5, y: .38, s: 2.2 },
        { name: 'The basket', note: 'Hanging on a rope.', x: .63, y: .74, s: 3.6 },
        { name: 'The trunk', note: 'Roots and a small box.', x: .47, y: .72, s: 2.6 }] }
  ]
};
