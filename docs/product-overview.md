# Product Overview — GenAI Delivery Copilot

> **Living document.** Update this if the product's purpose, core concepts, or headline
> capabilities change. See the maintenance rule in `CLAUDE.md`.

## What this is

A delivery copilot for banking programme managers — not a chatbot you ask one-off questions,
but a structured assistant that walks a programme through a defined sequence of delivery
phases, where each phase is staffed by specialist AI agents that interview you, and the output
of every conversation is a real, reviewable artefact (a Programme Charter, a Pilot Shortlist, a
Value Scorecard, and so on) rather than just a chat transcript.

## Why it exists

Banking programme managers spend a large share of their time producing the same kinds of
documents — charters, blueprints, backlogs, status reports — under tight regulatory and
governance constraints, often while context-switching between multiple programmes. This product
aims to compress that document-production effort, while keeping a human firmly in control of
what actually gets approved and used: nothing an agent produces is final until you explicitly
approve it.

## The core idea, in one sentence

**Pick a programme → talk to the agent responsible for the current step → review what it
produced → approve it → the next step unlocks.**

## Key concepts

- **Programme** — the top-level thing you're delivering (e.g. "Mortgage Origination
  Modernisation"). Has a name, an optional client, a chosen delivery approach, and free-text
  notes shared with every agent working on it.
- **Persona** — the overall delivery approach for the programme. Today: "Modernising Legacy
  Journey" (for replacing/upgrading an existing legacy system). A second persona, "Agentic
  Delivery" (for building new AI-agent-based capability from scratch), exists in the product
  vision but isn't usable yet.
- **Phase** — a stage within a persona's journey (e.g. "Foundation"). Phases happen in order;
  you can't skip ahead.
- **Agent** — a specialist within a phase, responsible for a specific slice of the work (e.g.
  "Estate Mapping" maps your current technical estate). You have a real conversation with an
  agent; it asks clarifying questions until it has enough to produce its artefacts.
- **Artefact** — a named, structured output an agent produces (e.g. "Modernisation Blueprint").
  Every artefact starts as a draft and must be explicitly **approved** by you before it counts.
- **Phase gate** — the checklist of every artefact required to complete a phase. Once every
  artefact in the current phase is approved, the gate is "clear" and the next phase can unlock.
- **Cross-cutting agent** — unlike phase agents, available immediately on any programme via a
  header button rather than the sidebar, and not gated behind phase progression. Four are built:
  Governance Guardian, Cost Compass, Roadmap Architect, and Comms Architect.

## What exists today

The **Modernising Legacy Journey** persona is **fully built and complete**: all three phases
(Foundation, Forge, Amplify), 16 agents in total, each producing real artefacts via
conversation, with approval and phase-gating enforced end to end — including the phase
transitions themselves, not just checklists.

**All four cross-cutting header agents are live** — available immediately on any programme, not
gated behind phase progression:

- **Governance Guardian** — reviews your programme's actual artefacts against the regulatory
  frameworks you selected (PRA, FCA, DORA, etc.) and produces a Compliance Charter, Governance
  Pulse, and Regulatory Gap Matrix. Grounded in your real content, not generic boilerplate.
- **Cost Compass** — surfaces where your AI token budget is going: spend by agent, spend
  velocity, a forward projection at current run rate, and specific optimisation suggestions.
  Produces a Cost Blueprint and a Spend Signal.
- **Roadmap Architect** — turns the programme's current artefacts and phase state into three
  audience-specific planning outputs: a Horizon Map (delivery team timeline), Sprint Canvas
  (sprint-by-sprint plan), and Stakeholder Roadmap (one-page executive summary, business
  outcomes only).
- **Comms Architect** — produces stakeholder communications grounded in actual artefact content
  and KPI data: SteerCo Pack, Board Signal, Escalation Notice, and Stakeholder Bulletin — each
  for a distinct audience and cadence.

**MCP integrations** are live — connect Jira, Confluence, SharePoint, or any MCP-compatible
server in Settings, and every agent automatically has access to those tools when generating
artefacts. Claude can fetch real Jira tickets or read Confluence pages mid-conversation without
you copying and pasting anything.

The **Agentic Delivery persona** is the main remaining gap — visible but not yet selectable when
creating a programme. See `docs/business-specification.md` for the exact build status of every
piece.

## Who it's for

Programme managers running structured delivery (especially legacy modernisation) at a bank or
similarly regulated organisation, who want AI assistance producing governance artefacts without
losing control over what gets finalised, and who are comfortable reviewing AI-generated content
before it's used.

## Accounts

Real accounts now exist (email + password, with email confirmation) — this is a **shared
workspace**: every signed-in user sees and can act on every programme, with no per-person
silos. Sign-up is open.
