# Writing candidates

Fred asked for this list. It proposes the v1 home wording and six posts, and shows where each comes
from. It is not built or published: `scripts/build.mjs` copies an explicit public file list, and
`docs/` is not on it.

Every post is `draft: true`. Fred authorized reading and proposing from these sources. That is not
approval to publish. Each item needs his edit or approval, and publication needs a separate decision.

Vault paths are relative to `../ObsidianVault/Buckets/`. Line numbers are from the notes as read on
this branch; Fred may since have edited them. Excerpts are short and come from authorized passages.
No names, rates, dates or client results are quoted.

## Home page

`index.html`. It keeps the live page's look and section layout from `origin/main` `59520ff`. Only the
wording changes.

- Sources: `Writing/cta.md` lines 3, 9, 17, 41-43 ("building a business is such a fascinating strategy
  game"; "I will never feel a call to action"). `Green/Green_thesis.md` line 35 ("an engine, built to
  optimize and regenerate the finite resources of the earth"). `ethos/Preparing for Anything - The
  TinyMacro Thesis.md` lines 25, 33, 43. `ethos/Standings.md` lines 34-43 (knowledge work is harder to
  automate than code).
- Edits: the Experience and education section is gone (client names and a graduation date). The
  Consulting link and resume PDF are gone. The Writing list now sits in that section's place. The
  claims keep the argument but state the cost of knowledge work and unused technology as Fred's
  thesis, not as fact.
- Fred to approve: the hero sentence, and "The environmental work there is still a proposal, not a
  product." That sentence refers to the Green direction, not to TinyMacro or its runtime.

## 1. Why I want this pointed at the environment

`posts/why-the-environment.md` (the existing A)

- Source: `Writing/cta.md` lines 3, 9, 11-13, 15, 17, 37-43.
- Excerpt: "my life's purpose is not to build something that will make other people money".
- Edits: modest. Joined the strategy-game opening (lines 3-13) to the existing A excerpt. Fixed typos.
  Removed the pointer to a research repo and the agency detail. Recast "It is no secret that
  enterprise pollutes a lot more than consumer" as Fred's belief.
- Fred to flesh out or approve: whether the travel paragraph stays, and whether "It is not to sell
  business insurance" still reads as he means it.

## 2. What general agents cannot do

`posts/what-general-agents-cannot-do.md` (the existing B)

- Source: `Writing/cta.md` lines 56-63 and 67-69. The same passage is in `Green/Green_thesis.md` lines
  98-112.
- Excerpt: "it is important to ascertain what general agents cannot do".
- Edits: modest. Split into paragraphs and fixed typos. Dropped the named hotel on line 55. Added the
  closing from lines 67-69.
- Fred to flesh out: one concrete example of accreditation or a supply-side asset he would pursue
  first, if he wants to name one.

## 3. What I mean by Green

`posts/what-i-mean-by-green.md` (true Green)

- Sources: `Green/Green_thesis.md` lines 8, 16, 29-32, 35 and 79. `Green/Green_Vertical.md` lines 18
  and 32. `ethos/Preparing for Anything - The TinyMacro Thesis.md` lines 29 and 33.
- Excerpts: "the implementation and application of novel technologies by scale"; "The upside can NEVER
  be to 'go green'"; "Treating enthusiasm as validation would be a mistake."
- Edits: Green is written as a proposed engine throughout ("I want Green to be", "It would"), with
  "None of it is built yet." Fred's order is kept: finite resources, then technology, then how the
  connection scales (diligence, connection, specialty), then why now. Incentives, tax, compliance deadlines,
  carbon-market ideas and named companies are left out. The cheaper-research point is conditional.
- Fred to flesh out: one real kind of technology and site he has in mind, described without a
  prospect's name.

## 4. Why Green needs an ontology

`posts/why-green-needs-an-ontology.md`

- Sources: `Green/Green_thesis.md` lines 14, 26, 30 and 70-76 (a vendor description Fred quoted of an
  ontology as an index; it inspired the post's "I want the ontology to serve as the index too",
  which is written as a design goal, not a paraphrase or a claim about current behavior). `Green/Green_thesis.md` line 86
  (the database list). `ethos/Preparing for Anything - The TinyMacro Thesis.md` lines 23-27.
- Excerpt: "corroboration, and ontology occurs to connect and prove evidentiary application".
- The opening frames information lost to chat histories as the failure Fred wants to avoid, not as a
  general fact.
- Edits: the decision-and-evidence example (inputs, method, gaps) follows the Green demo intent in
  `Green/Green_Demo_Initiation.md` line 43. That line is a spec, not Fred's prose, so the example is
  framed as what "could" look like. The fine-tuned classifier stays an open question.
- Fred to flesh out: whether to mention Jev by name, and one example object and link from the current
  Green ontology work in `tinymacro-green` (not read for this draft).

## 5. Why I put the agent in a container

`posts/the-agent-in-a-container.md`

- Sources: `ethos/Preparing for Anything - The TinyMacro Thesis.md` lines 9, 11, 15, 17, 19 and 43.
  `ethos/Standings.md` line 16 (container and email). `Green/Green_Demo_Initiation.md` lines 6-11
  (Fred's own note on the container endpoint for inbound email). `Primitives-Harness/General-PH.md`
  lines 39-41 (the open research question).
- Technical reuse: the per-vertical permissions material from the deleted
  `posts/per-vertical-agent-permissions.md`, rechecked against `primitives-harness` `33c5bcf`. Each
  claim maps to source:
  - "a folder ... plus one small file that lists the capabilities": `runtime/verticals/chat/effects.json`,
    `runtime/verticals/sdr/effects.json`, `runtime/verticals/green/effects.json`; loaded by exact
    identity with no registry in `runtime/src/vertical-effects.cjs` lines 3-14.
  - "only the capabilities that are in both the vertical's list and the caller's own allowance",
    "refused rather than quietly trimmed": `admitRunCapabilities` in `runtime/src/contracts.ts`
    lines 333-344, described in `runtime/architecture.md` lines 48-61.
  - "The admitted list is stored with the run, and anything the run starts gets tools only from that
    list": `runtime/architecture.md` lines 58-61.
  - "local tests that run every shipped vertical file through the real admission function":
    `runtime/test/vertical-effects.test.mjs` lines 8, 20 and 32 (every folder resolves; unknown names
    and path tricks are denied; requests must be inside both lists), and
    `runtime/test/vertical-effects.test.ts` lines 33, 57, 67, 85 and 107 (stored grant, unknown vertical
    at the durable boundary, replay rechecks, child tools limited to the parent grant).
  - The commit message records that provider and deployed behavior were not exercised. The post says
    the same: source and local tests only, with no deployed claim.
- Excerpt: "the containerized harness matters, but also why it is not the whole company".
- Edits: only built behavior is stated as fact. The persistent sandbox in the simplification plan is
  not built yet, so it is not described.
- Fred to approve: naming Pi, and whether the email entry point should stay tied to the Green demo.

## 6. A content harness for Shoply

`posts/a-content-harness-for-shoply.md` (case study)

- Sources: the live `consulting.html` line on ShoplyAI at `origin/main` `59520ff` (Fred's own public
  wording). `../shoplyweb-clean/shoply-harness/AGENTS.md`, read as text only: lines 3 (router and
  single-product config), 10 (git stays with the person), 18-20 (the number-verification rule), 22
  (failures become guards), 46 (humanizing pass) and 56. Stage names come from the headings of
  `commands/blog-pipeline.md`. `state.md`, `status.md`, deliverables, ledgers and secrets were not
  opened. Nothing was run in that repository.
- Structure: problem, approach, review and limits, following the Varick case-study pages. No text from
  them.
- Edits: no metrics, dates, results or client-private details. The reproducible-but-wrong count is
  described in general terms, without its figures. The router and pipeline spec show intended rules,
  not enforcement, so the post describes the stages, collision check, resumability, git boundary and
  humanizing pass as what the instructions and workflow prescribe. Its limits section says the page
  does not show how consistently they were followed.
- Fred to approve: the client's consent to be named "Shoply", and whether any outcome can be stated.
  Stating one would need the harness's own number checks and TMH's claim rules.

## Removed

`posts/per-vertical-agent-permissions.md` is deleted. Its verified technical material now lives in
item 5, so the set stays at six rather than adding an unrelated seventh post.
