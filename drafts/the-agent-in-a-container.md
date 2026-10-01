---
title: Why I put the agent in a container
description: A place to run useful work, and the limits of what a general agent can supply.
draft: true
---
I want a small set of capabilities I can combine around a real problem: research, analysis, evidence gathering, document production. The interface should fit the situation. Sometimes that is a conversation, sometimes an API or an email address.

A container gives an agent a place to run ordinary tools against real files. It gives me a configured environment I can inspect and reproduce. That is why I put the agent there.

## Keep the work separable

Models and runtimes will change. I want the useful parts of a setup to survive that change: the operating knowledge, tested components and evidence behind a decision. A web app can be one way into the system without owning all of its behavior.

I want a kind of work to be understandable as a folder of instructions, tools and templates. Someone should be able to open it and see what it is for. Permissions and external actions need explicit boundaries around that work. A container alone does not decide which actions are appropriate or make an agent's answer correct.

These are design priorities, not a description of every guarantee in the current runtime. The implementation has changed as I have tested it. A claim about recovery, permissions or a deployed run needs evidence from that particular implementation.

## What a general agent cannot supply

The environment is only part of the problem. A capable general agent does not arrive with the relationships, accreditation or local knowledge needed to do every job.

Consider research about an environmental technology. An agent might find papers and compare claims. Deciding whether the technology belongs at a particular site can require measurements, engineering judgment, a supplier and someone accountable for the work. Preparing a document does not supply those things.

That is where I want to look for lasting value: learning the work well enough to know which parts can be delegated, which need specialist judgment and which depend on access we do not yet have.

I want to open the code, run one piece, watch what it does and decide what happens next. The container helps make that possible. The reason to build the system still comes from the work outside it.
