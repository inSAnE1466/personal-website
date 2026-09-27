# Design: frederickcaseyhousand.com

This is the durable visual law for the home, resume, and writing pages. Extend it only when Fred
changes the public site's direction.

Direction (owner amendment, 2026-08-24): a compact personal document in Inter, black and white,
with no branded header or persistent page chrome. Navigation is only a small row of text links in
normal document flow.

## Structure

- Home is a long, left-aligned document with a concise opening statement. Resume is one printable
  page: print hides the navigation and the print note and fits one US Letter sheet.
- All content shares one page gutter. Ordinary prose stays at 68ch or less; two-column prose stays
  at 60ch per column and collapses below 60rem.
- Hairline section rules separate major reading units and the home claims. The navigation has no
  rule or container.
- The homepage explains why Fred is working in this field and states granular, evidence-bounded
  positions on harness engineering, evals, retrieval, agent context, and the future of work. It
  does not use placeholder questions or a public portfolio.
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
  links and the focus ring. Navigation stays ink.
- No other chromatic accent, gradient, shadow, glass, texture, or decorative image.

## Typography

- Inter Variable is the only intentional family. Arial, Helvetica, and system sans are fallbacks.
- Use only weights 400 and 600.
- Body text is 16px with 1.625 line height.
- Navigation uses 13px; claims use 18px; ledes range from 18 to 22px; section headings range
  from 26 to 38px; the home H1 ranges from 44 to 80px with tight tracking.
- Type and spacing create hierarchy. No eyebrows, decorative labels, or monospace costume.

## Navigation

- There is no header, wordmark, or top-left “Fred Casey-Housand” label.
- The semantic `<nav>` contains three visible text links: Home, Writing, and Resume. TinyMacro and
  the booking link live in prose, not the nav.
- Navigation is `position: static`; it scrolls away with the document.
- Links remain visible at every viewport and wrap when necessary. There is no hamburger, disclosure
  menu, filled nav CTA, border, background panel, radius, blur, or shadow.
- Visible nav text is small, Inter, and 600 weight. Its invisible vertical hit area remains at least
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
- An index lists titles, dates and short descriptions; articles use ordinary headings and prose.
- Draft previews are explicitly labeled and excluded from the normal static build.
- Preserve Fred’s originals and voice; layout samples are not finished owner writing.
