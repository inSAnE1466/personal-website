---
title: Giving each agent vertical its own permissions
description: How TinyMacro's agent runtime decides what a run may do, with the decision kept in one file per vertical.
kind: case study
draft: true
---
TinyMacro runs one agent runtime for several kinds of work. This is how that runtime decides which tools a given run gets, what is built, and what is still unproven.

| At a glance | |
| --- | --- |
| Problem | One runtime serves several kinds of work and more than one caller. Each needs different tools, and no caller should get more than it was allowed. |
| What is built | Each vertical's folder carries a file listing the capabilities it may use. A run is admitted only inside that list and the caller's own allowance, and the result is stored with the run. |
| Status | Implemented in the runtime source, with local tests. This page makes no claim about deployed runs. |

## The problem

The runtime calls each kind of work a vertical. There are three today: a general chat, a market research vertical that drafts outreach for a person to approve, and an environmental vertical that works from a fixed set of evidence.

They need different tools. Research needs web search. Work that must answer only from the evidence it was given should not have it. Chat needs nearly everything.

The runtime also has more than one caller. The web application is one; a headless caller, with no browser or application database, is meant to trigger the same work. Each caller has its own allowance.

So the question is who decides what a run can do, and where that decision is written down.

## What I built

Each vertical is a folder holding its skills, templates and one small file, `effects.json`. The file names the vertical and lists the capabilities it may use:

| Vertical | Capabilities |
| --- | --- |
| Chat | Read, write, edit and search files; shell; subagents; web search and page reading; end a task; request an application effect; propose a protected change |
| Market research | The same set as chat |
| Environmental | Read and write files; shell; end a task |

The rest follows from that file.

- The runtime finds the file by the vertical's name. Adding a vertical means adding a folder, with no list to update elsewhere. A name that does not match the file exactly is refused.
- When a run starts, it gets only capabilities that are in both the vertical's list and the caller's allowance. If the caller asks for something outside either, the whole request is refused rather than quietly trimmed.
- If the caller asks for nothing in particular, it gets the default set, narrowed to that overlap.
- The admitted list is stored with the run. Subagents the run starts get tools only from that stored list. A run with no stored list gets nothing, not the defaults.
- If the same request arrives again, the runtime checks the stored list against the caller's current allowance before answering. An allowance that has shrunk since the first request is enforced.

### Why a file

The grant sits next to the vertical's skills and templates. Opening the folder tells you what that vertical can do, and changing what it can do is a one-line diff someone can review.

## What is proven, and what is not

The loader, the admission rule, the stored grant and the recheck on replay are in the runtime source. Local tests run every shipped vertical file through the real admission function. They cover unknown names, path tricks in a name, and requests outside either grant.

Three limits matter.

- Shell is one capability, and it is a broad one. The grant decides whether a vertical gets a shell inside its container. It does not decide what the shell does there.
- This page cites source and local tests only. It makes no claim about how deployed runs behave.
- "Add a folder and nothing else" is tested on three verticals. Whether it holds for the next one is a hypothesis until the next one exists.

## Open questions

- Should shell be split into narrower capabilities for verticals that only need to run known scripts?
- How should a person reviewing a run see the grant it ran under?
