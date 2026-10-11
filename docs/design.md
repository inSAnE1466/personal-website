# Design — frederickcaseyhousand.com

This is the durable visual law for the homepage and writing pages. Extend it only when Fred
changes the public site's direction.

Direction (owner amendment, 2026-08-24): a compact personal document in Inter, black and white,
with no branded header or persistent page chrome. Navigation is only a small row of text links in
normal document flow.

## Structure

- Home is a long, left-aligned document with a concise opening statement.
- All content shares one page gutter. Ordinary prose stays at 68ch or less; two-column prose stays
  at 60ch per column and collapses below 60rem.
- Hairline section rules may separate major reading units, but the navigation has no rule or
  container.
- The homepage makes Fred's general argument: finite resources, preservation through new technology,
  and why cheaper knowledge work makes it more urgent. Its positions are evidence-bounded, and it
  does not use placeholder questions, a resume or a public portfolio.
- Home ends with its contact section. Writing pages do not. There is no footer.
- Portfolio material remains private and unlinked.

## Palette

Shared semantic tokens and the licensed Inter asset are pinned in `design-system/` from TMFA commit
`0dd20c57cf2fea0a6422abb16a55392e5727edfb`. Document aliases below consume those roles.

- Near-white document field: `#fafaf9`.
- Near-black ink: `#0f0e0d`.
- Secondary ink: `#33312c`.
- Muted but accessible text: `#706d66`.
- Soft rules and secondary surfaces: `#cccac6` and `#fafaf9`.
- No chromatic accent, gradient, shadow, glass, texture, or decorative image.

## Typography

- Inter Variable is the only intentional family. Arial, Helvetica, and system sans are fallbacks.
- Use only weights 400 and 600.
- Body text is 16px with 1.625 line height.
- Navigation uses 13px; claims use 18px; ledes range from 18–22px; section headings range
  from 26–38px; display headings range from 38–62px.
- Type and spacing create hierarchy. No eyebrows, decorative labels, or monospace costume.

## Navigation

- The name “Fred Casey-Housand” links home. Writing and TinyMacro sit opposite it; there is no separate Home link.
- Writing appears when the build includes a post: published posts in public builds, or drafts in local previews.
- Navigation is `position: static`; it scrolls away with the document.
- Links remain visible at every viewport and wrap when necessary. There is no hamburger, disclosure
  menu, filled nav CTA, border, background panel, radius, blur, or shadow.
- Visible nav text is small, Inter, and 600 weight. Its invisible vertical hit area remains at least
  44px.

## Links and actions

- Text links are bold, never underlined. A link must not combine bold and underline in any state.
- Hover uses one short color transition; it must not move text or change layout. Keyboard focus uses
  the existing 2px outline with 3px offset.
- Primary in-document actions may retain a compact near-black fill, white bold type, and 10px radius.
  They are actions, not navigation chrome.
- Long addresses and labels must wrap safely under zoom.

## Rhythm and motion

- Use the named four-point spacing tokens. Prefer compact groups and clear separation over oversized
  whitespace.
- Pages are still. The only authored motion is the 140ms link or button color transition.
- Remove transitions under `prefers-reduced-motion: reduce`.

## Shared obligations

- Home and writing pages use the same navigation markup, type tokens, link contract, focus treatment, CTA
  treatment, and gutters.
- Copy, URLs, and facts are content authority and are not changed by visual polish.
- When choosing a CSS technique for layout, spacing, motion or show and hide, check
  [good-css](../../tinymacro-research/guides/interface-design-evidence.md#good-css) first. It is technique
  guidance, not visual direction, and never overrides this file.

## Writing (owner direction, S12.2)

- A simple Markdown blog extends the existing document layout with one left-aligned reading column.
- The index is a plain list of titles, like an essay archive. No dates, labels, descriptions, cards,
  images or tags.
- An article is its title and its text: ordinary headings and prose, with no dek, contents list,
  summary table or contact section.
- Draft previews carry one short notice and are excluded from the normal static build.
- Preserve Fred’s originals and voice; layout samples are not finished owner writing.
