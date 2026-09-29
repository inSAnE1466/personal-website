---
title: A content harness for Shoply
description: An agent harness for one product's content, written as rules and workflows with human gates and a rule that every number is wrong until checked.
draft: true
---
For Shoply, I built content infrastructure: an agent harness that researches, drafts, checks and prepares posts and reports for one product, with hard rules against generic machine writing and unchecked numbers.

## The problem

The work was a steady flow of posts for one product, plus honest reporting on how that product was doing in search. An agent can draft quickly. The harder part is everything around the draft: knowing what is worth writing, keeping the voice from sounding machine-made, and making sure a number in a post or a report is actually right.

## What I built

The harness is a folder of plain files that any agent host can load. A short router tells the agent the rules and where everything lives. Rules, skills and commands each have their own directory, and every client-specific value, such as the site, brand terms and author details, lives in one config file. Scripts read that file instead of hardcoding anything, so the same harness could point at a different product.

The workflow for a post is written as stages: research, then a check of the research, then a draft, then a check of the draft, then a separate verification pass, then a person's approval, and only then publishing. The workflow tells each stage to write its output to its own folder so a run can be resumed, and tells the publish step to check for collisions first and stop on any it finds.

The instructions keep git with the person. The agent is told not to commit to the main branch, push or merge.

## How it is reviewed

The rule I care most about is that every number is wrong until proven right. The instructions say a number in a draft, report or client message has to come from a command, query or file that someone can run again. That is necessary, but not enough. A count can be reproducible and still wrong, for example when a query quietly includes rows that belong to someone else. So each figure also has to say what population it covers, what independent source should agree with it, what time window it uses, and what would make it wrong.

The instructions also require a humanizing pass on generated copy. And when something breaks, the fix is not meant to be finished until the class of failure is written down as a rule, a check or a guard, and that guard is shown to catch the original failure.

## Limits

This page describes how the harness is organized and the rules and workflows it prescribes. It does not show how consistently they were followed, and it makes no claim about traffic, rankings or revenue. Those numbers belong to the client, and they would have to pass the same checks before I repeated them.

The approval gates are only as good as the person using them. Writing review into the workflow makes it expected. It does not make it happen.
