---
title: Why I put the agent in a container
description: A containerized harness, and a kind of work as a folder the same container can load.
draft: true
---
I am not trying to assemble a collection of AI features, wrap each one in a website, and call the result a company. Competing feature by feature against businesses with more staff, capital and data is not the advantage I want.

What I want is a small set of capabilities that can be combined for a real problem: research, organization, analysis, evidence gathering, document production, scopes of work. They should be reachable through whatever interface fits the situation, whether that is a conversation, a CLI, an API, an email address or a narrow website, rather than another dashboard.

The agent runtime is one layer of that. I want to be able to run Pi today, something else tomorrow, or a better agent when one appears. Models and harnesses will change. The value that lasts should live in the tested components, the operating knowledge, the research, and the evidence that a particular setup solved a particular problem.

That is why the containerized harness matters, and also why it is not the whole company. A container gives the agent a dependable place to run. It makes a configured agent reproducible, and lets it use real files, tools, processes and workspaces. A stable service can call the harness, keep its state, and replace the runtime underneath.

It also means the web app is only one way in. Building an agent into a container lets us pick a runtime and connect it to things like an email address. For the Green demo, I pictured the main entry point as a container with an endpoint for inbound email, where clients send messages and attachments and the work continues from there. The dashboard is where you audit what the agent did, not the only place it lives.

I want a kind of work to be a folder. In the runtime I build, each vertical is a folder of skills and templates plus one small file that lists the capabilities it may use. Research needs web search. Work that must answer only from the evidence it was given should not have it. When a run starts, it gets only the capabilities that are in both the vertical's list and the caller's own allowance, and a request for anything outside either is refused rather than quietly trimmed. The admitted list is stored with the run, and anything the run starts gets tools only from that list.

Opening the folder tells you what that vertical can do, and changing it is a one-line change someone can review. Adding a vertical means adding a folder.

All of that is in the runtime source, with local tests that run every shipped vertical file through the real admission function, including unknown names and requests outside either list. I make no claim here about how deployed runs behave. "Add a folder and nothing else" is tested on three verticals so far. Whether it holds for the next one is a hypothesis until the next one exists.

There are open questions I have not answered. Shell access is one broad capability: the list decides whether a vertical gets a shell, not what the shell does inside the container. And what skills, instructions and context should a container carry so that verticals plug in without stepping on each other? That is a research question, and I want to answer it from what actually runs.

I want to be able to open the code, understand what is left, run one piece, watch what it does, and decide what happens next. A container with a folder of work in it is the simplest version of that I have found.
