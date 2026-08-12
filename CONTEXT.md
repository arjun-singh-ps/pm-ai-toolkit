# GenAI Delivery Copilot

An AI-powered delivery copilot for banking and enterprise programme managers, built as a
multi-agent system on the Anthropic Claude API.

## Language

**Programme**:
The top-level entity everything else (agents, artefacts, phases, chat sessions) is scoped to — one
client engagement. Has a fixed `persona` (set at creation, never switched) and selected
`regulatory_frameworks[]`. There is no separate "project" entity in this product.
_Avoid_: Project, engagement (as a system term)

**Common Context**:
A pool of context shared *across* programmes for the same client, populated by artefact approvals,
explicit human edits, and human-approved distillations of chat messages. A programme only receives
another programme's Common Context if it explicitly subscribes to it — nothing shares
automatically. See [ADR-0001](docs/adr/0001-common-context-cross-programme-sharing.md).
_Avoid_: Shared context, global context

**Context Subscription**:
A directional, live link where one programme (the subscriber) opts in to receive another
programme's (the source's) Common Context. Self-service — the source's consent isn't required,
since both already share the same client. Not symmetric: subscribing to a source does not make the
source receive the subscriber's context back.
_Avoid_: Link, connection

**Programme Notes**:
Free-text context for a *single* programme, stored on the `programmes` row and injected live into
every agent's system prompt for that programme only. Pre-existing and unrelated to Common Context,
which spans multiple programmes.
_Avoid_: Notes, context (always qualify which kind — Programme Notes vs. Common Context)

**Intelligence Fabric / Evolving Intelligence Fabric / Agent Prompt Fabric**:
Named artefacts a specialist agent writes *about* a fictional client's own agent architecture
(e.g. Knowledge Forge produces "Intelligence Fabric"). Text deliverables like any other artefact —
they do not read or write any shared state, and are unrelated to Common Context or to this
product's own prompt-construction pipeline.
_Avoid_: Do not treat these as this product's context-sharing mechanism — they are not.
