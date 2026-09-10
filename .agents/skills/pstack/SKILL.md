---
name: pstack
description: "Use pstack as the engineering workflow. Select a playbook, load its upstream guidance, route native Codex work by capability, and prove the result on the real surface."
---

# pstack

pstack is the engineering workflow for this workspace. It replaces Compound Engineering. Local
repository instructions and owner authorization still outrank it.

The pinned upstream source lives under `vendor/pstack/`. Load only the playbook and principle leaves
needed for the current task. Start with `vendor/pstack/skills/poteto-mode/SKILL.md`, then open the
matching playbook under `vendor/pstack/skills/poteto-mode/playbooks/`. Do not edit the vendored
tree. Put local adaptations here.

For a new or changed behavior, use `feature.md`. For a defect, use `bug-fix.md`. For a behavior
preserving cleanup, use `refactoring.md`. For a design fork, use `prototype.md`. For a read-only
question, use `investigation.md`. Use `vendor/pstack/skills/figure-it-out/SKILL.md` when no
playbook fits.

Before writing logic, read the relevant principle leaves. The recurring choices here are
`principle-foundational-thinking`, `principle-build-the-lever`, `principle-make-operations-idempotent`,
`principle-minimize-reader-load`, `principle-test-behavior-not-implementation`, and
`principle-prove-it-works`. Apply only the leaves that affect the task and name the choice they
changed in the reply.

Use a todo list whose first entries copy the chosen playbook steps. Keep skipped steps with a short
reason. Build the smallest reusable script when a task is non-trivial. Verify the real artifact and
the real execution surface. Receipts and old test results are historical evidence only.

Use native Codex subagents only. Route bounded lookup, extraction, validation and ordinary
implementation checks to `gpt-5.6-luna`. Route architecture, security, concurrency, migrations,
deployment and adversarial review to `gpt-6-astra`. Never invoke Cursor, Claude, another external
provider, or a provider fallback.

Use the owning repository's declared verification skill and real execution surface. An unavailable
repository or an undeclared gate is a failed verification outcome. A receipt does not turn either
state into success. The workspace coordinator distributes this pinned vendor tree and adapter with
its installer. The installer is idempotent and leaves conflicting local files untouched.

Apply `vendor/pstack/skills/unslop/SKILL.md` to prose and
`vendor/pstack/skills/technical-writing/SKILL.md` to durable technical documents.
