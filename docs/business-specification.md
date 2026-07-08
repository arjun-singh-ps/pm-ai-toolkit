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

All four header-button agents are **now built and live**. Orchestrator, Persona Selector,
Artefact State, KPI Monitor, and Responsible AI have no UI presence yet and no backing logic.

**Governance Guardian (BUILT)** — reviews the programme's existing artefacts (any status —
approved and draft, status-labeled) against its selected regulatory frameworks and produces:
Compliance Charter, Governance Pulse, Regulatory Gap Matrix. If no frameworks are selected or no
artefacts exist yet, it says so plainly rather than producing generic output — directly
satisfying rule #10 below.

**Cost Compass (BUILT)** — reviews token spend from the programme's `cost_records`, aggregates
by agent using Decimal arithmetic, and produces: Cost Blueprint (total spend broken down by
agent/phase, plain-language interpretation) and Spend Signal (spend velocity, forward projection
at current run rate, optimisation options). Tracks differently per persona: Legacy = cost per
agent/artefact/sprint vs hours saved; Agentic = chassis vs pillar costs, cost per user, cost per
1,000 prompts.

**Roadmap Architect (BUILT)** — injects the programme's existing artefact summary and produces:
Horizon Map (phase-and-milestone timeline for the delivery team, persona-specific), Sprint Canvas
(sprint-by-sprint plan derived from the active backlog artefact), and Stakeholder Roadmap (one-page
executive summary, business outcomes only, no programme jargon).

**Comms Architect (BUILT)** — injects artefacts and KPI snapshots and produces: SteerCo Pack
(weekly/fortnightly, RAG status, decisions, risks), Board Signal (monthly, one page, board-level
language), Escalation Notice (condition-triggered, crisp factual format), and Stakeholder Bulletin
(broader team update, non-technical).

All four follow the same architecture: `AgentConfig` in `src/agents/cross-cutting/`, server-only
context builder in `src/lib/*Context.ts`, wired via `src/lib/crossCuttingContext.ts`. Their
artefacts are tagged `phase: "cross-cutting"` — visible in the Artefacts tab and History but
never counted toward any phase's gate checklist.

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
  (multi-select: PRA, FCA, ECB/SSM, SR 11-7, EBA Guidelines, DORA, ISO 42001, Client Custom —
  editable post-creation from the programme screen), and free-text notes (shared with every
  agent's context).
- **Artefacts**: name, phase, activity, producing agent, version, status (draft / in_progress /
  approved), structured content, approval timestamp and approver.
- **Chat history**: full conversation per (programme, agent) pair, replayed on every turn.
- **Cost records**: token usage and decimal-calculated USD cost per Claude call (pricing figures
  are approximate placeholders — see Technical Documentation §8).
- **KPI snapshots**: written by three agents during their conversations — Delivery Intelligence
  (Foundation, Quality of Modernisation + AI Tool Upskill levers), Signal Watch (Forge, Pace of
  Modernisation lever), and Delivery Heartbeat (Amplify, all three levers as current actuals).
  Displayed in the KPIs tab of the right panel, grouped by lever, most recent value per metric.

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

## 9. MCP integrations (BUILT)

A workspace-wide integration layer that connects external tools to every agent. Configured
in Settings; stored in a new `mcp_integrations` table (shared workspace — one set of
integrations available to all programmes and users).

Supported types: **Jira**, **Confluence**, **SharePoint**, **Custom MCP**. Each integration
stores a server URL and an optional auth token. Enabled integrations are injected into every
Claude API call via the Anthropic SDK's `beta.messages.create` with `mcp_servers` — Claude
can use MCP tools (e.g. search Jira, read Confluence) alongside the standard
`record_artefact` tool during any agent conversation.

**Constraint**: MCP server URLs must be publicly accessible. Internal instances behind
corporate VPN/firewall need a hosted proxy.

**Security note**: auth tokens are stored as plain text in Supabase for the MVP — RLS protects
them from unauthenticated access, but at-rest encryption should be added before production use
with real API keys.

## 10. Agent interaction model — reactive vs proactive

### 10.1 The distinction

A **reactive agent** responds when you open it and ask. It may have rich context about the
programme, but it does nothing until you initiate.

A **proactive agent** knows what the programme needs and surfaces it before you ask. Per the
framing that shaped this product's design direction, proactive behaviour requires three things
a reactive agent doesn't have:

1. **Programme state** — continuous awareness of where the programme is in its lifecycle.
2. **Threshold logic** — an embedded definition of what "bad" looks like, so the agent can
   detect a problem before you tell it one exists.
3. **Memory across sessions** — the ability to spot a trend (velocity this week vs last week)
   rather than only react to the current state in isolation.

### 10.2 Current state — all agents are reactive

Every agent in the product today is **reactive**. They all receive programme state as injected
context (criterion 1 is met structurally), but none have threshold logic or self-trigger across
sessions (criteria 2 and 3 are absent). An agent only runs when a user opens it.

Within reactive, three sub-types describe the design intent of each agent:

- **Conversational reactive** — gathers information from the PM through dialogue before
  generating. The agent interviews first; the artefact comes from the conversation.
- **Monitoring reactive** — designed to watch for signals (velocity, spend, quality trends)
  but currently only runs when opened. These are the natural candidates for proactive
  evolution once threshold logic is built.
- **Synthesis reactive** — reads what has already been produced (artefacts, KPIs, cost
  records) and turns it into analysis or communication outputs without needing to gather
  new information first.

### 10.3 Categorisation — all 33 agents

#### Modernising Legacy — Foundation phase

| Agent | Sub-type | Design intent |
|---|---|---|
| Scope Sprint | Conversational reactive | Interviews the PM to define programme scope, pilots, value case |
| Estate Mapping | Conversational reactive | Interviews the PM to map the current technical estate |
| Infrastructure Blueprint | Conversational reactive | Interviews the PM to assess platform readiness |
| Knowledge Forge | Conversational reactive | Captures institutional knowledge the agents will use throughout |
| Backlog Architecture | Conversational reactive | Sequences the modernisation work into a delivery backlog |
| Delivery Intelligence | Synthesis reactive | Sets up reporting cadence and records the first KPI baselines from conversation |
| Launch Readiness | Conversational reactive | Confirms the programme is ready to move from planning to pilot |

#### Modernising Legacy — Forge phase

| Agent | Sub-type | Design intent |
|---|---|---|
| Pilot Ignition | Conversational reactive | Runs the first end-to-end pilot build through conversation |
| Signal Watch | **Monitoring reactive** | Designed to watch the live pilot for early warning signs — runs only when opened |
| Scale Blueprint | Conversational reactive | Defines how to scale what's been proven |

#### Modernising Legacy — Amplify phase

| Agent | Sub-type | Design intent |
|---|---|---|
| Backlog Pulse | Synthesis reactive | Re-prioritises the backlog based on what the pilot taught |
| Context Flywheel | Conversational reactive | Keeps the Intelligence Fabric current as delivery evolves |
| Factory Build | Conversational reactive | Designs the scaled delivery factory and service catalogue |
| Launch Runway | Synthesis reactive | Confirms quality gates are met before each capability launch |
| Delivery Heartbeat | **Monitoring reactive** | Designed for continuous monitoring across all three KPI levers — runs only when opened |
| Evolution Engine | Synthesis reactive | Charts the programme's next horizon |

#### Cross-cutting agents

| Agent | Sub-type | Design intent |
|---|---|---|
| Governance Guardian | Synthesis reactive | Reads all artefacts, checks against selected regulatory frameworks |
| Cost Compass | **Monitoring reactive** | Designed to surface spend trends and forward projections — runs only when opened |
| Roadmap Architect | Synthesis reactive | Synthesises artefact state into delivery team, sprint, and executive planning outputs |
| Comms Architect | Synthesis reactive | Synthesises artefacts and KPIs into stakeholder communications |

#### Agentic Delivery — Envision and Shape (not yet built)

| Agent | Sub-type | Design intent |
|---|---|---|
| Vision Ignition | Conversational reactive | Defines the agentic north star through dialogue |
| MVP Covenant | Conversational reactive | Shapes the solution proposal and engagement charter |
| Use Case Discovery | Conversational reactive | Discovers and prioritises use cases through structured interviews |
| Agentic Blueprint | Conversational reactive | Designs the agent architecture through dialogue |
| Team Launch | Conversational reactive | Establishes the team covenant and delivery flight plan |

#### Agentic Delivery — Incubate and Prove (not yet built)

| Agent | Sub-type | Design intent |
|---|---|---|
| Environment Ignition | Conversational reactive | Sets up the compliant agent environment through guided steps |
| Agent Foundations | Conversational reactive | Builds the prompt fabric and evaluation covenant through dialogue |
| Proving Ground | Synthesis reactive | Synthesises the proving charter and pioneer agent release |
| Value Delivery Sprint | Synthesis reactive | Synthesises sprint outcomes into refined releases |
| Performance Pulse | **Monitoring reactive** | Designed to watch live agent signals across KPI dimensions — runs only when opened |
| Scale Readiness | Conversational reactive | Prepares the prompt catalogue and organisation rollout plan |

#### Agentic Delivery — Scale (not yet built, strategic adviser mode)

| Agent | Sub-type | Design intent |
|---|---|---|
| Platform Expansion | Synthesis reactive (strategic adviser) | No fixed artefacts — responds to strategic questions |
| Governance Engine | Synthesis reactive (strategic adviser) | No fixed artefacts — responds to strategic questions |
| Value Sequencer | Synthesis reactive (strategic adviser) | No fixed artefacts — responds to strategic questions |
| Transformation Blueprint | Synthesis reactive (strategic adviser) | No fixed artefacts — responds to strategic questions |

### 10.4 Agents most suited to become proactive

Four agents have monitoring in their design brief and are the natural first candidates once
threshold logic and cross-session memory are built:

| Agent | Built | What proactive would look like |
|---|---|---|
| **Signal Watch** | ✅ | Detects pilot velocity drop > threshold, cross-references against open RAID items, drafts an Intelligence Pulse with the right escalation flag — before the PM notices the trend |
| **Delivery Heartbeat** | ✅ | Monitors all three KPI levers; surfaces a Delivery Signal Report automatically when any metric crosses its warning threshold |
| **Cost Compass** | ✅ | Monitors spend rate; alerts when the projected monthly cost exceeds a defined programme budget before the sprint ends |
| **Performance Pulse** | 🔲 | Watches live agent accuracy and latency across the Agentic Delivery KPI dimensions; drafts a Full Spectrum KPI Report when a dimension dips below its agreed threshold |

**Agent mode toggle (BUILT)** — users can now set each monitoring agent to **Proactive** or
**Reactive** per programme from the programme settings screen (the same screen as Notes and
Regulatory Frameworks). The preference is stored in `programmes.proactive_agents[]` and
displayed as a ⚡ badge in the sidebar for proactive agents. A banner on the programme home
screen lists active proactive agents and prompts the user to open them for their latest
assessment.

Performance Pulse is shown in the toggle UI but disabled (marked "coming soon") — it is not
yet implemented.

**What the toggle does NOT do yet** — the scheduled trigger infrastructure (cron job, threshold
configuration per programme, in-app alert table) does not yet exist. Proactive mode stores and
displays the user's intent; the agents still only run when opened. See Technical Documentation
§13 for the full architecture of what full proactive behaviour requires.

## 11. Known product gaps (intentional, not bugs)

- Cost figures are directional, not accurate to current Anthropic pricing — the per-million-token
  prices in `src/lib/cost.ts` are approximate placeholders; verify against Anthropic's current
  pricing page before treating them as accurate spend data.
- No per-user permissions or data isolation — by design (shared workspace), not a missing
  feature.
