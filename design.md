# Design — frederickcaseyhousand.com

This is the durable visual law for the homepage and consulting page. Extend it only when Fred
changes the public site's direction.

Direction (owner amendment, 2026-08-24): a compact personal document in Arial, black and white,
with no branded header or persistent page chrome. Navigation is only a small row of text links in
normal document flow.

## Structure

- Home and Consulting are long, left-aligned documents with concise opening statements.
- All content shares one page gutter. Ordinary prose stays at 68ch or less; two-column prose stays
  at 60ch per column and collapses below 60rem.
- The consulting page may keep one full-width black band. Hairline section rules may separate major
  reading units, but the navigation has no rule or container.
- The homepage explains why Fred is working in this field and states granular, evidence-bounded
  positions on harness engineering, evals, retrieval, agent context, and the future of work. It
  does not use placeholder questions or a public portfolio.
- Each page ends with its contact section. There is no footer.
- Portfolio material remains private and unlinked.

## Palette

- Pure white page: `#ffffff`.
- Near-black ink: `#171717`.
- Secondary ink: `#3f3f3f`.
- Muted but accessible text: `#666666`.
- Soft rules and secondary surfaces: `#dedede`, `#ededed`, and `#f6f6f6`.
- No chromatic accent, gradient, shadow, glass, texture, or decorative image.

## Typography

- Arial is the only intentional family. Helvetica and system sans are fallbacks.
- Use only weights 400 and 600.
- Body text is 16px with 1.625 line height.
- Navigation uses 13px; claims use 18px; ledes range from 18–22px; section headings range
  from 26–38px; display headings range from 38–62px.
- Type and spacing create hierarchy. No eyebrows, decorative labels, or monospace costume.

## Navigation

- There is no header, wordmark, or top-left “Fred Casey-Housand” label.
- The semantic `<nav>` contains exactly four visible text links: Home, Consulting, TinyMacro, and
  Book a call.
- Navigation is `position: static`; it scrolls away with the document.
- Links remain visible at every viewport and wrap when necessary. There is no hamburger, disclosure
  menu, filled nav CTA, border, background panel, radius, blur, or shadow.
- Visible nav text is small, Arial, and 600 weight. Its invisible vertical hit area remains at least
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

- Both pages use the same navigation markup, type tokens, link contract, focus treatment, CTA
  treatment, and gutters.
- Copy, URLs, and facts are content authority and are not changed by visual polish.
