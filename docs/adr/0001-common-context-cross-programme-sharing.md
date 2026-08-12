---
status: proposed
---

# Common Context: opt-in, client-scoped sharing between programmes

## Context

Agents already share context *within* a single programme — `programmes.notes` is injected live
into every agent's system prompt, and `getExtraContext` gives specific cross-cutting agents their
own DB-backed context. Nothing shares context *across* programmes; each is fully isolated. We want
a prior programme's approved knowledge (e.g. a completed engagement for the same bank) to inform a
new or ongoing programme for that same client, without inventing automatic matching that could
silently blend content between programmes nobody asked to link.

## Decision

Introduce **Common Context**: a hub-and-spoke pool of shared context, hard-scoped to a single
`client` — never crosses clients. A programme populates its own contributions via three triggers:
artefact approval and explicit human edits propagate verbatim (both already passed a human
checkpoint); chat messages are distilled by a background service (not a new agent) and held
**pending** until a human approves them, since AI-distilled content hasn't been reviewed yet.

Other programmes never see this automatically. A PM on Programme Y must explicitly subscribe their
programme to Programme X via a picker (self-service, no consent required from X's team — the
client boundary is already the trust line). Persona and regulatory-framework overlap only rank
candidates in that picker; they never auto-share. Subscriptions are:

- **Live**, not a snapshot — Y keeps seeing X's future contributions.
- **Directional**, not symmetric — Y subscribing to X does not make X see Y's context back.
- **Adjustable any time**, not fixed at programme creation.
- **Frozen, not hidden**, if the source programme is archived — existing approved entries stay
  visible, no new ones are added.

## Considered options

- **Cross-client sharing** — rejected. Real compliance exposure in a PRA/FCA/DORA-governed tool:
  one client's programme notes could surface in another client's agent chat.
- **Automatic matching by persona/regulatory-framework, no manual step** — rejected. Makes
  cross-programme links invisible and unintentional; nobody could later explain why Programme Y's
  agents know something that originated in Programme X.
- **Peer-to-peer reads between programmes** — rejected in favour of one client-scoped pool. N×N
  relationships are harder to reason about and audit than programmes reading from and contributing
  to a single shared store.
- **Broadcasting raw chat messages** — rejected. Expensive at ~40 agents per programme, mostly
  exploratory noise, and propagating unreviewed AI output across programmes with no human
  checkpoint is the part of this design most likely to cause a bad outcome if wrong.

## Consequences

- New data: a context-pool store (content, source programme, client, origin type, status
  pending/approved, approver) and a directional subscription table (subscriber, source).
- New UI: a 4th right-panel tab, "Common Context" (pool view, pending-approval queue, subscription
  picker) — the three-tab right panel described in `CLAUDE.md` needs updating alongside this ADR.
- No new cross-cutting agent — distillation is a background service call, so the 9-agent
  cross-cutting count is unchanged and Scale-phase-style "strategic adviser" agent sprawl is
  avoided.
- Governance Guardian and other regulatory-aware agents may now receive context that originated in
  a *different* programme's regulatory-framework selection; this is out of scope for this ADR and
  should be revisited before Common Context is wired into agent prompts.
