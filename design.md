# Design: frederickcaseyhousand.com

This is the durable visual law for the home and writing pages. Extend it only when Fred
changes the public site's direction.

Direction (owner amendment, 2026-08-24): a compact personal document in Inter, black and white,
with no persistent page chrome. Navigation is one row of text in normal document flow.

Amendment (S12.2): no resume and no dates for past work. Home states Fred's intentions (technology
for social good, finite resources and conservation) and leads into Writing, which must be easy to
find. Warm monochrome, sparse dark green.

## Structure

- Home is a left-aligned document: an opening statement, why, what Fred wants to build, the
  writing list, how he thinks agent systems should work, and contact. From 64rem, section
  headings sit in a 14rem left column and the prose keeps one edge; below, they stack.
- All content shares one page gutter. Ordinary prose stays at 68ch or less; two-column prose stays
  at 60ch per column and collapses below 60rem.
- Hairline section rules separate major reading units and the home claims. The navigation has no
  rule or container.
- The homepage states intentions and positions, not a list of clients or outcomes. Past work
  appears only as approved case studies in Writing.
- Each page ends with its contact section. There is no footer.
- Portfolio material remains private and unlinked.

## Palette

Shared semantic tokens and the licensed Inter asset are pinned in `design-system/` from TMFA commit
`36b88eee7d16108caebe652428591b05d58a37ba`. Document aliases below consume those roles.

- Near-white document field: `#fafaf9`.
- Near-black ink: `#0f0e0d`.
- Secondary ink: `#33312c`.
- Muted but accessible text: `#706d66`.
- Soft rules and secondary surfaces: `#cccac6` and `#fafaf9`.
- Dark green link accent: the pinned `--primary` (`hsl(152 45% 24%)`), used only for in-document
  links, the focus ring, the current-page nav underline, nav hover and the quotation rule.
  Navigation text stays ink at rest.
- No other chromatic accent, gradient, shadow, glass, texture, or decorative image.

## Typography

- Inter Variable is the only intentional family. Arial, Helvetica, and system sans are fallbacks.
- Use only weights 400 and 600.
- Body text is 16px with 1.625 line height.
- Navigation uses 15px; home and essay prose and claims 17px with 1.7 line height; ledes and deks 18 to
  22px; section headings 26 to 38px (18px in the wide-screen left column); page H1s 38 to 62px.
- Type and spacing create hierarchy. No eyebrows, decorative labels, or monospace costume.

## Navigation

- The semantic `<nav>` holds Fred's name at the left, linking home, and Writing at the right.
  TinyMacro and the booking link live in prose, not the nav.
- The current destination (Writing on writing pages) carries a 2px dark green underline. Hover
  turns nav text green.
- Navigation is `position: static`; it scrolls away with the document.
- Links remain visible at every viewport and wrap when necessary. There is no hamburger, disclosure
  menu, filled nav CTA, border, background panel, radius, blur, or shadow.
- Visible nav text is ink, Inter, and 600 weight. Its invisible vertical hit area remains at least
  44px.

## Links and actions

- Text links are bold and dark green, never underlined. A link must not combine bold and underline in any state.
- Hover uses one short color transition; it must not move text or change layout. Keyboard focus uses
  the existing 2px outline with 3px offset.
- Long addresses and labels must wrap safely under zoom.

## Rhythm and motion

- Use the named four-point spacing tokens. Prefer compact groups and clear separation over oversized
  whitespace.
- Pages are still. The only authored motion is the 140ms link color transition.
- Remove transitions under `prefers-reduced-motion: reduce`.

## Shared obligations

- All pages use the same navigation markup, type tokens, link contract, focus treatment, and gutters.
- Copy, URLs, and facts are content authority and are not changed by visual polish.

## Writing (owner direction, 2026-09-06)

- A simple Markdown blog extends the existing document layout with one reading column.
- An index lists kind (essay or case study), titles and short descriptions. Dates show only when a
  post has one. Articles open with the description as a dek; three or more sections add a contents
  list, beside the text from 72rem and above it below that. Case studies follow a context, problem,
  approach, result and next-step order with a summary table first (structure only, after Varick's).
- Draft previews are explicitly labeled and excluded from the normal static build.
- Preserve Fred’s originals and voice; layout samples are not finished owner writing.
