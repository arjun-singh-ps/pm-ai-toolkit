---
name: genai-delivery-copilot
description: >
  Use this skill whenever working on the GenAI Delivery Copilot —
  an AI-powered delivery assistant for banking programme managers.
  Covers agent architecture, methodology, UI, database schema, 
  API routes, and coding standards for this specific product.
  Trigger when: editing any file under src/agents/, src/app/, 
  src/components/, src/lib/, or tests/. Also trigger when the user 
  asks about adding a new agent, artefact, persona, phase, or 
  cross-cutting capability.
---

# GenAI Delivery Copilot — IDE Skill

## What this product is

An AI-powered delivery copilot for banking and enterprise programme
managers. It is a multi-agent system built on the Anthropic Claude API.
Two personas, eight phases, 31 specialist agents, nine cross-cutting
agents, named artefacts across both personas (see
docs/business-specification.md for the current, authoritative count —
this file describes the target architecture, that one tracks what's
actually built).

The user is an 18-year programme management veteran who is a beginner
developer. Always explain WHY before HOW. Always state which file to
edit and where in the file. Flag beginner traps. Use programme
management analogies for technical concepts.

---

## Persona 1 — Modernising Legacy Journey

Three phases: Foundation → Forge → Amplify

### Foundation phase — 7 agents

src/agents/modernisation/foundation/

- scopeSprint.ts → Programme Charter, Pilot Shortlist, Value Scorecard
- estateMapping.ts → Modernisation Blueprint, Delivery Compass
- infrastructureBlueprint.ts → Platform Readiness Report
- knowledgeForge.ts → Intelligence Fabric
- backlogArchitecture.ts → Delivery Backlog
- deliveryIntelligence.ts → Command Centre, Signal Engine, Quality Covenant
- launchReadiness.ts → Forge Charter, Crew Blueprint, Forge Compass
  ⬡ PHASE GATE: all Foundation artefacts approved before Forge unlocks

### Forge phase — 3 agents

src/agents/modernisation/forge/

- pilotIgnition.ts → Pilot Intelligence Pack, Steel Thread Proof,
  Adoption Accelerator
- signalWatch.ts → Intelligence Pulse
- scaleBlueprint.ts → Scale Compass, Operations Playbook

### Amplify phase — 6 agents

src/agents/modernisation/amplify/

- backlogPulse.ts → Living Backlog
- contextFlywheel.ts → Evolving Intelligence Fabric
- factoryBuild.ts → Experience Blueprints, Modernised Service Catalogue
- launchRunway.ts → Quality Gate Report, Launch Playbook
- deliveryHeartbeat.ts → Delivery Signal Report, Deployment Covenant,
  Live Pulse Monitor
- evolutionEngine.ts → Capability Evolution Plan

### KPI framework — three levers

Quality of Modernisation: code coverage, vulnerabilities,
documentation accuracy
Pace of Modernisation: code conversion outcomes, human-in-loop
review effort, context enrichment time, iterations to accepted output
AI Tool Upskill: time to understand tool components,
time to understand agent outcomes

---

## Persona 2 — Agentic Delivery

Five phases: Envision → Shape → Incubate → Prove → Scale

### Envision phase — 2 agents (2 weeks, commercial and vision)

src/agents/agentic/envision/

- visionIgnition.ts → Agentic North Star, Vision Proof
- mvpCovenant.ts → Solution Proposal, Engagement Charter

### Shape phase — 3 agents (4 weeks, discovery and architecture)

src/agents/agentic/shape/

- useCaseDiscovery.ts → Shared Vision Document, Impact Scorecard,
  Discovery Shortlist
- agenticBlueprint.ts → Agent Architecture Blueprint,
  Human-Agent Workflow Map, Data Signal Map,
  Agent Intervention Backlog
- teamLaunch.ts → Team Covenant, Delivery Flight Plan,
  Access Readiness Log

### Incubate phase — 3 agents (8 weeks, build the foundation)

src/agents/agentic/incubate/

- environmentIgnition.ts → Compliant Agent Environment,
  Data Integration Layer
- agentFoundations.ts → Agent Prompt Fabric, Responsible AI Shield,
  Agent Engine Blueprint, Evaluation Covenant
- provingGround.ts → Agent Command Centre, Proving Charter,
  Pioneer Agent Release

### Prove phase — 3 agents (12 weeks, MVP to production)

src/agents/agentic/prove/

- valueDeliverySprint.ts → Proven Feature Releases,
  Refined Intelligence Fabric,
  Adoption Accelerator Pack
- performancePulse.ts → Live Agent Signal, Full Spectrum KPI Report
- scaleReadiness.ts → Prompt Catalogue, Scale Agent Register,
  Organisation Rollout Plan

### Scale phase — 4 agents (principles-led, no fixed artefacts)

src/agents/agentic/scale/

- platformExpansion.ts → strategic adviser mode
- governanceEngine.ts → strategic adviser mode
- valueSequencer.ts → strategic adviser mode
- transformationBlueprint.ts → strategic adviser mode
  NOTE: Scale agents do not produce fixed artefacts. They act as
  strategic advisers. Do not add deliverable tracking to Scale agents.

### KPI framework — three dimensions

AI and Engineering Impact: accuracy, relevancy, faithfulness, latency
People Impact: active vs total users, prompts per department,
adoption by department/office/seniority, prompts per user per seniority,
functionality-wise usage statistics
Financial Impact: chassis run costs, pillar run costs,
monthly runtime cost projection

---

## Cross-cutting agents — always available, both personas

src/agents/cross-cutting/

- orchestrator.ts → master router, intent detection, phase tracking.
  Advisory only — produces no fixed artefacts.
- personaSelector.ts → detects and switches between personas.
  Produces: Persona Recommendation
- artefactState.ts → tracks completion status of every artefact across
  both personas. Produces: Programme Status Report
- kpiMonitor.ts → surfaces correct KPI framework per persona.
  Produces: KPI Interpretation Report
- responsibleAi.ts → guardrail review on all generated artefacts.
  Produces: AI Safety Review (per artefact), Guardrail Compliance Report
  (programme-wide)
- governanceGuardian.ts → compliance, regulatory framework evaluation
- costCompass.ts → token cost tracking and optimisation
- roadmapArchitect.ts → Horizon Map, Sprint Canvas, Stakeholder Roadmap
- commsArchitect.ts → SteerCo Pack, Board Signal, Escalation Notice,
  Stakeholder Bulletin

### Governance Guardian — regulatory frameworks

Selectable at programme setup, multiple can be active simultaneously:
PRA, FCA, ECB/SSM, SR 11-7, EBA Guidelines, DORA,
ISO 42001, Client Custom (document ingestion)
Produces: Compliance Charter, Governance Pulse, Regulatory Gap Matrix

### Cost Compass — tracks differently per persona

Legacy: cost per artefact, per code file, per sprint, vs hours saved
Agentic: chassis costs, pillar costs, cost per user, cost per 1000 prompts
Produces: Cost Blueprint, Spend Signal

### Roadmap Architect — three outputs

Horizon Map: visual phase and milestone timeline
Sprint Canvas: sprint-by-sprint plan from active backlog artefact
Stakeholder Roadmap: executive deck, business outcomes only
Behaves differently per persona — see CLAUDE.md for detail

### Comms Architect — four outputs

SteerCo Pack: weekly/fortnightly, RAG status, decisions, risks
Board Signal: monthly, one page, business outcomes only
Escalation Notice: triggered by defined conditions per persona
Stakeholder Bulletin: wider team update, non-technical

---

## Agent behaviour rules — enforce on every agent file

1. Never generate an artefact without confirming programme name,
   persona, phase, and the specific artefact being requested
2. All artefacts must include: version, date, programme name,
   owner field, AI-generated disclaimer
3. Check artefact dependencies — some cannot be produced without
   prior artefacts being complete
4. Phase gates must be checked before unlocking the next phase
5. When a user skips a step, warn of delivery risk, record the skip,
   flag it in the next artefact — do not block
6. Adjust tone by stakeholder audience:
   - Engineering team: technical depth, metrics, code references
   - SteerCo: RAG status, decisions required, risks
   - Board: ROI, milestones, business outcomes only
7. Scale phase agents in Agentic Delivery: strategic adviser mode only,
   no fixed artefact generation
8. Responsible AI is first-class — surface guardrails proactively
9. Prompt Catalogue and Agent Prompt Fabric are different things —
   never conflate them
10. Governance Guardian must always reference the selected regulatory
    frameworks — never produce generic governance output

---

## Tech stack

Framework: Next.js 16 App Router, TypeScript strict mode
Database: Supabase — Postgres (pgvector for semantic search is speced but not yet
  built — 8 tables exist today, see docs/technical-documentation.md §3)
AI: Anthropic Claude API — claude-sonnet-4-6 for all agents
Styling: Tailwind CSS
Testing: Vitest (unit), Playwright (E2E)
Deploy: Google Cloud Run (app), Supabase (DB) — see docs/technical-documentation.md
  for the Dockerfile/Cloud Build setup
Auth: Supabase Auth

---

## Coding standards — enforce on every file

- TypeScript strict mode — no any types, ever
- Every function needs a JSDoc comment
- Every file needs a header comment: what it is and why it exists
- Commit format: feat: / fix: / chore: / docs: / test:
- All secrets via process.env — never hardcoded
- All errors handled explicitly — no silent failures
- All financial calculations use Decimal — never floating point
- All PII fields masked in logs
- All AI outputs labelled as AI-generated with disclaimer

---

## Database schema — key tables

programmes
id, name, client, persona, active_phase,
regulatory_frameworks[], notes, proactive_agents[], archived, created_at

artefacts
id, programme_id, artefact_name, phase, activity,
agent_name, version, status (draft/in_progress/approved),
content, created_at, approved_at, approved_by

chat_sessions
id, programme_id, agent_name, phase, activity,
messages jsonb, created_at

kpi_snapshots
id, programme_id, persona, lever_or_dimension,
metric_name, value, recorded_at

cost_records
id, programme_id, agent_name, tokens_in, tokens_out,
cost_usd, artefact_id, created_at

mcp_integrations
id, name, type (jira/confluence/sharepoint/custom), server_url,
auth_token, enabled, created_at

agent_alerts
id, programme_id, agent_name, what, why_matters[], suggested_action,
triggered_at, status (active/dismissed), dismissed_at, dismissed_by,
dismiss_reason

programme_documents
id, programme_id, filename, file_type (pdf/xlsx/xls/docx/doc),
content_text, uploaded_by, created_at

---

## UI layout — three-panel shell

Left sidebar (220px):

- Persona and programme name (persona is fixed at programme creation —
  there is no switch toggle; Persona Guide only advises, it never
  changes `programme.persona`)
- Phase and activity navigator with status dots and phase gate markers

Centre panel (flex):

- Header: programme name + phase chip, Roadmap/History/KPIs nav, and
  nine cross-cutting agent buttons in two labelled groups — Programme
  Intelligence (Navigator, Persona Guide, Artefact State, KPI Monitor,
  AI Safety Review) and Delivery Outputs (Governance Guardian, Cost
  Compass, Roadmap Architect, Comms Architect)
- Chat area: agent messages with inline artefact cards
- Input bar: textarea + send button

Right panel (240px):

- Tab 1 Artefacts: live status of all artefacts for current phase
- Tab 2 KPIs: KPI framework for active persona
- Tab 3 Gate: phase gate checklist and advance button

Colour coding:
Legacy persona: coral accent
Agentic persona: purple accent
Artefact approved: green
Artefact in progress: blue
Artefact pending: grey
Phase gate incomplete: amber
Phase gate clear: green

Routes:
/ landing — programme select or create
/login Supabase Auth sign-in
/signup Supabase Auth sign-up
/auth/callback Supabase Auth callback (route handler, not a page)
/programme/[id] main three-panel shell
/programme/[id]/roadmap phase timeline, browse a completed phase read-only
/programme/[id]/history all artefacts with filter and search
/programme/[id]/kpis full KPI dashboard
/settings MCP integrations and regulatory framework reference
/user-guide practical step-by-step usage guide

---

## What NOT to do

- Do not use any types in TypeScript
- Do not hardcode API keys, client names, or programme names
- Do not generate artefacts without the required inputs confirmed
- Do not conflate Prompt Catalogue with Agent Prompt Fabric
- Do not produce generic governance output without checking
  which regulatory frameworks are selected for this programme
- Do not unlock the next phase before the phase gate checklist is complete
- Do not treat Scale phase agents as deliverable generators —
  they are strategic advisers only
- Do not use floating point for any financial calculations
- Do not log PII under any circumstances

---

## Documentation maintenance

Four living documents exist under `docs/`:

- `docs/business-specification.md` — product/business view: personas, phases, agents,
  artefacts, business rules, and which of these are actually built vs. still aspirational.
- `docs/technical-documentation.md` — engineering view: architecture, data model, agent
  pattern, API routes, testing strategy, known technical debt.
- `docs/product-overview.md` — what the product is and why it exists, for someone unfamiliar
  with it.
- `docs/user-guide.md` — a practical, step-by-step walkthrough of using the product as it
  actually exists right now.

**Whenever a change adds, removes, or changes product behaviour — a new agent, a schema
change, a new route, a renamed UI flow, a retired feature, a fixed bug worth recording —
update every document above that's affected, in the same piece of work, not as an
afterthought.** All four files are written to reflect what's actually built, marking
aspirational/not-yet-built parts explicitly, never describing unbuilt features — or UI flows
that don't exist — as if they were real.

---

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
