# Session context contract

`session-context/v1` renders named repository files as text. It creates a content-addressed receipt for the exact files, order, phase, and Git revision.

Use it at three managed seams:

```sh
node .agents/session-context/context-loader.mjs load start
node .agents/session-context/context-loader.mjs load resume
node .agents/session-context/context-loader.mjs load subagent --include path/to/task-plan.md
```

Paste the complete `subagent` output into the worker prompt. The worker must return the exact `CONTEXT_RECEIPT` token. Verify it before you accept the result:

```sh
node .agents/session-context/context-loader.mjs verify "$CONTEXT_RECEIPT"
```

Run `check` in repository gates:

```sh
node .agents/session-context/context-loader.mjs check
```

## Enforcement boundary

The loader records the bytes it rendered. It does not prove that a host placed those bytes in a
model prompt or that a model understood them. The managed procedure requires the complete output in
the prompt, requires the worker to return the token, and rejects a missing or stale token. This is a
deterministic acceptance check, not a cryptographic binding to a host prompt.

The loader also cannot detect a hidden host compaction event when the host gives the repository no
hook. A managed session must treat any resume after compaction as invalid until `load resume` runs.

The final output line contains the receipt. If a host truncates the output, the receipt is missing
and the load is invalid. Each file and the whole text bundle must be at most 32 KiB. Keep startup
context small. Load a task plan or source with `--include` only when the complete bundle stays
inside that bound. Read larger sources in explicit, complete chunks outside this receipt contract.

The loader always rejects `.env` files and Git internals. It also rejects path traversal, symlinks,
binary files, oversized bundles, manifest deny paths, and protected paths declared by the repository
adapter. Each repository must list its other sensitive paths in `denyPaths` or the adapter policy.
