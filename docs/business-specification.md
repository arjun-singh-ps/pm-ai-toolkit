# Business Specification — GenAI Delivery Copilot

> **Living document.** This reflects the product as it actually exists today, not just the
> aspiration. Every section below is marked with its build status. Update this file in the same
> commit as any change that adds, removes, or changes product behaviour — see the maintenance
> rule in `CLAUDE.md`.

## 1. Product vision

An AI-powered delivery copilot for banking and enterprise programme managers. A multi-agent
system, built on the Anthropic Claude API, that walks a programme through structured delivery
phases, each phase served by specialist agents that interview the user conversationally and
produce named, versioned, human-approved artefacts.

Target user: an experienced programme manager who is a beginner developer. The product must
explain concepts in plain terms, never assume technical fluency, and never produce an artefact
without a human approving it first.

## 2. Personas and phases

| Persona | Phases | Status |
|---|---|---|
| **Modernising Legacy Journey** | Foundation → Forge → Amplify | **Fully built — this persona is complete.** |
| **Agentic Delivery** | Envision → Shape → Incubate → Prove → Scale | Not started. Visible in the UI as a disabled option when creating a programme. |

### 2.1 Modernising Legacy Journey — Foundation phase (BUILT)

Seven agents, run in strict linear order — each requires the previous agent's artefacts to be
**approved** before it unlocks:

| Order | Agent | Artefacts produced |
|---|---|---|
| 1 | Scope Sprint | Programme Charter, Pilot Shortlist, Value Scorecard |
| 2 | Estate Mapping | Modernisation Blueprint, Delivery Compass |
| 3 | Infrastructure Blueprint | Platform Readiness Report |
| 4 | Knowledge Forge | Intelligence Fabric |
| 5 | Backlog Architecture | Delivery Backlog |
| 6 | Delivery Intelligence | Command Centre, Signal Engine, Quality Covenant |
| 7 | Launch Readiness | Forge Charter, Crew Blueprint, Forge Compass |

The phase gate (all 14 artefacts above approved) is checked, visible in the UI, and **advancing
to Forge actually works** — re-checked server-side, never just a disabled button — via
`POST /api/programmes/[id]/advance-phase`.

### 2.2 Modernising Legacy Journey — Forge phase (BUILT)

Three agents, same linear-dependency convention as Foundation (Pilot Ignition's first agent
has no dependency — entering Forge at all already implies the Foundation gate was clear):

| Order | Agent | Artefacts produced |
|---|---|---|
| 1 | Pilot Ignition | Pilot Intelligence Pack, Steel Thread Proof, Adoption Accelerator |
| 2 | Signal Watch | Intelligence Pulse |
| 3 | Scale Blueprint | Scale Compass, Operations Playbook |

The Forge→Amplify transition works the same way as Foundation→Forge.

### 2.3 Modernising Legacy Journey — Amplify phase (BUILT)

Six agents, same linear-dependency convention as Foundation and Forge:

| Order | Agent | Artefacts produced |
|---|---|---|
| 1 | Backlog Pulse | Living Backlog |
| 2 | Context Flywheel | Evolving Intelligence Fabric |
| 3 | Factory Build | Experience Blueprints, Modernised Service Catalogue |
| 4 | Launch Runway | Quality Gate Report, Launch Playbook |
| 5 | Delivery Heartbeat | Delivery Signal Report, Deployment Covenant, Live Pulse Monitor |
| 6 | Evolution Engine | Capability Evolution Plan |

Amplify is the **last** phase of this persona — there's no further phase to advance into, which
is a meaningfully different end state from Forge→Amplify (where the next phase exists in
principle but isn't built yet). The Gate tab distinguishes the two: once a programme enters
Amplify, the right panel shows "🏁 This is the final phase of this persona." instead of a
permanently-disabled "Advance" button, since the latter would read like a bug rather than an
intentional stopping point. Confirmed visually via a Playwright screenshot during this build,
not just by code review.

### 2.4 Agentic Delivery persona (NOT BUILT)
Five phases (Envision, Shape, Incubate, Prove, Scale), 15 agents total, per the original vision.
Scale-phase agents are intended to act as strategic advisers with no fixed artefacts, never as
deliverable generators.

## 3. Cross-cutting agents

Nine named in the original vision: Orchestrator, Persona Selector, Artefact State, KPI Monitor,
Responsible AI, Governance Guardian, Cost Compass, Roadmap Architect, Comms Architect.

**Governance Guardian (BUILT)** — the first cross-cutting agent. Available immediately on any
programme, regardless of phase, via a header button (not the phase-scoped sidebar). Reviews the
programme's existing artefacts (any status — approved and draft, status-labeled) against its
selected regulatory frameworks and produces: Compliance Charter, Governance Pulse, Regulatory
Gap Matrix. If no frameworks are selected or no artefacts exist yet, it says so plainly rather
than producing generic output — directly satisfying rule #10 below. Its artefacts are tagged
`phase: "cross-cutting"`, so they show up in the Artefacts tab and History but never count
toward any phase's gate checklist — cross-cutting work doesn't block phase progression.

Cost Compass, Roadmap Architect, and Comms Architect remain visible, disabled header buttons —
placeholders for later. Orchestrator, Persona Selector, Artefact State, KPI Monitor, and
Responsible AI have no UI presence yet and no backing logic.

## 4. Business rules (status per rule)

| # | Rule | Status |
|---|---|---|
| 1 | Never generate an artefact without confirming programme name, persona, phase first | **Enforced structurally** — the UI pins these via navigation before any chat is possible; the engine refuses to run an agent without a resolved programme. |
| 2 | Every artefact includes version, date, programme name, owner, AI-generated disclaimer | **Enforced** — merged server-side into every artefact, never trusted from the model. |
| 3 | Artefact dependencies checked before an agent can run | **Enforced** for the linear chain within each of Foundation, Forge, and Amplify. |
| 4 | Phase gates checked before unlocking the next phase | **Enforced**, server-side, for Foundation → Forge and Forge → Amplify. Amplify has no further phase to unlock — correctly shown as a "final phase" end state, not a stuck gate. |
| 5 | Skipped input → warn of risk, proceed with a stated assumption, flag in the artefact | **Enforced via agent prompting** — agents are instructed to do this; not independently validated by code. |
| 6 | Tone varies by audience (engineering / SteerCo / board) | **Not enforced** — no audience-selection mechanism exists yet. |
| 7 | Scale-phase agents are strategic advisers only, no fixed artefacts | N/A — Scale phase not built. |
| 8 | Responsible AI guardrails surfaced proactively | **Partially enforced** — every artefact is labelled "AI-generated, review before use"; no dedicated guardrail agent exists. |
| 9 | Never conflate "Prompt Catalogue" with "Agent Prompt Fabric" | N/A — neither artefact exists yet (not in the Foundation phase). |
| 10 | Governance Guardian must reference selected regulatory frameworks | **Enforced via agent prompting** — its system prompt requires referencing the programme's actual selected frameworks and existing artefact content, and explicitly refuses to produce generic output when frameworks or artefacts are missing; verified live, not just in the prompt text. |

## 5. Data captured today

- **Programmes**: name, client (optional), persona, active phase, regulatory frameworks
  (multi-select: PRA, FCA, ECB/SSM, SR 11-7, EBA Guidelines, DORA, ISO 42001, Client Custom),
  and free-text notes (shared with every agent's context).
- **Artefacts**: name, phase, activity, producing agent, version, status (draft / in_progress /
  approved), structured content, approval timestamp and approver.
- **Chat history**: full conversation per (programme, agent) pair, replayed on every turn.
- **Cost records**: token usage and decimal-calculated USD cost per Claude call (pricing figures
  are approximate placeholders — see Technical Documentation §8).
- **KPI snapshots**: table exists, nothing writes to it yet (no KPI Monitor agent).

## 6. Authentication and multi-user (BUILT)

Real Supabase Auth (email + password, with required email confirmation) replaces the old
single-user placeholder. **Shared team workspace model, confirmed**: every logged-in user sees
and can act on every programme — there is no per-user data isolation, and that's an intentional
product decision, not a gap. Sign-up is open (no invite-only restriction).

`artefacts.approved_by` and the `owner` field in artefact content now record the real, logged-in
user's email — verified live: a fresh sign-up, email confirmation, login, a real chat turn, and
an approval all show the actual account email, not the old `"owner"` placeholder. Existing test
data created before auth existed was intentionally not migrated (explicit decision — those old
rows still show `"owner"` and will not be retrofitted).

Row Level Security is now enabled on all 5 tables — necessary the moment a publishable/anon key
was exposed to the browser for login. The policies are deliberately a rubber stamp ("any
authenticated user, full access") matching the shared-workspace model — they are **not** an
authorization mechanism for per-user permissions (there are none) and must not be assumed to be
one if that's ever built. See Technical Documentation §5 for the access-control split.

## 7. Reviewing artefacts before approving (BUILT)

Originally a gap found during the auth verification pass: the Artefacts tab listed names and
statuses with an Approve button, but no way to actually read an artefact's content first — there
was no real "review" step despite that being a core business rule. Every artefact now has a
**View** action opening its full structured content (all sections, version, recorder, approver,
disclaimer) before approving.

## 8. Artefacts now appear immediately after being recorded (bug fix)

Found while testing Governance Guardian end-to-end (not specific to it — this affected every
agent): recording an artefact via chat never told the Artefacts/Gate tabs to refresh, so a newly
recorded artefact was invisible until the page was manually reloaded. Fixed — the Artefacts tab
now updates immediately after any agent's conversation records something.

## 9. Known product gaps (intentional, not bugs)

- Cost figures are directional, not accurate to current Anthropic pricing.
- Governance/compliance review is **not actually performed** — regulatory frameworks are
  captured but nothing checks artefacts against them yet.
- No per-user permissions or data isolation — by design (shared workspace), not a missing
  feature.
