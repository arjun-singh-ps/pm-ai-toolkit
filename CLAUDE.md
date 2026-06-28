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
Two personas, eight phases, 29 specialist agents, four cross-cutting
agents, 64 named artefacts across both personas.

The user is an 18-year programme management veteran who is a beginner
developer. Always explain WHY before HOW. Always state which file to
edit and where in the file. Flag beginner traps. Use programme
management analogies for technical concepts.

---

## Persona 1 — Modernising Legacy Journey

Three phases: Foundation → Forge → Amplify

### Foundation phase — 7 agents

src/agents/modernisation/foundation/

- scope-sprint.ts → Programme Charter, Pilot Shortlist, Value Scorecard
- estate-mapping.ts → Modernisation Blueprint, Delivery Compass
- infrastructure-blueprint.ts → Platform Readiness Report
- knowledge-forge.ts → Intelligence Fabric
- backlog-architecture.ts → Delivery Backlog
- delivery-intelligence.ts → Command Centre, Signal Engine, Quality Covenant
- launch-readiness.ts → Forge Charter, Crew Blueprint, Forge Compass
  ⬡ PHASE GATE: all Foundation artefacts approved before Forge unlocks

### Forge phase — 3 agents

src/agents/modernisation/forge/

- pilot-ignition.ts → Pilot Intelligence Pack, Steel Thread Proof,
  Adoption Accelerator
- signal-watch.ts → Intelligence Pulse
- scale-blueprint.ts → Scale Compass, Operations Playbook

### Amplify phase — 6 agents

src/agents/modernisation/amplify/

- backlog-pulse.ts → Living Backlog
- context-flywheel.ts → Evolving Intelligence Fabric
- factory-build.ts → Experience Blueprints, Modernised Service Catalogue
- launch-runway.ts → Quality Gate Report, Launch Playbook
- delivery-heartbeat.ts → Delivery Signal Report, Deployment Covenant,
  Live Pulse Monitor
- evolution-engine.ts → Capability Evolution Plan

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

- vision-ignition.ts → Agentic North Star, Vision Proof
- mvp-covenant.ts → Solution Proposal, Engagement Charter

### Shape phase — 3 agents (4 weeks, discovery and architecture)

src/agents/agentic/shape/

- use-case-discovery.ts → Shared Vision Document, Impact Scorecard,
  Discovery Shortlist
- agentic-blueprint.ts → Agent Architecture Blueprint,
  Human-Agent Workflow Map, Data Signal Map,
  Agent Intervention Backlog
- team-launch.ts → Team Covenant, Delivery Flight Plan,
  Access Readiness Log

### Incubate phase — 3 agents (8 weeks, build the foundation)

src/agents/agentic/incubate/

- environment-ignition.ts → Compliant Agent Environment,
  Data Integration Layer
- agent-foundations.ts → Agent Prompt Fabric, Responsible AI Shield,
  Agent Engine Blueprint, Evaluation Covenant
- proving-ground.ts → Agent Command Centre, Proving Charter,
  Pioneer Agent Release

### Prove phase — 3 agents (12 weeks, MVP to production)

src/agents/agentic/prove/

- value-delivery-sprint.ts → Proven Feature Releases,
  Refined Intelligence Fabric,
  Adoption Accelerator Pack
- performance-pulse.ts → Live Agent Signal, Full Spectrum KPI Report
- scale-readiness.ts → Prompt Catalogue, Scale Agent Register,
  Organisation Rollout Plan

### Scale phase — 4 agents (principles-led, no fixed artefacts)

src/agents/agentic/scale/

- platform-expansion.ts → strategic adviser mode
- governance-engine.ts → strategic adviser mode
- value-sequencer.ts → strategic adviser mode
- transformation-blueprint.ts → strategic adviser mode
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

- orchestrator.ts → master router, intent detection, phase tracking
- persona-selector.ts → detects and switches between personas
- artefact-state.ts → tracks completion status of all 64 artefacts
- kpi-monitor.ts → surfaces correct KPI framework per persona
- responsible-ai.ts → guardrail review on all generated artefacts
- governance-guardian.ts → compliance, regulatory framework evaluation
- cost-compass.ts → token cost tracking and optimisation
- roadmap-architect.ts → Horizon Map, Sprint Canvas, Stakeholder Roadmap
- comms-architect.ts → SteerCo Pack, Board Signal, Escalation Notice,
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

Framework: Next.js 14 App Router, TypeScript strict mode
Database: Supabase — Postgres + pgvector for semantic search
AI: Anthropic Claude API — claude-sonnet-4-6 for all agents
Styling: Tailwind CSS
Testing: Vitest (unit), Playwright (E2E)
Deploy: Vercel (frontend), Supabase (DB)
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
regulatory_frameworks[], created_at

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

---

## UI layout — three-panel shell

Left sidebar (220px):

- Persona toggle: Legacy / Agentic
- Programme name
- Phase and activity navigator with status dots and phase gate markers

Centre panel (flex):

- Header: breadcrumb + active agent badge +
  four cross-cutting agent buttons
  (Governance Guardian, Cost Compass, Roadmap Architect, Comms Architect)
- Chat area: agent messages with inline artefact cards
- Input bar: textarea + send button

Right panel (240px):

- Tab 1 Artefacts: live status of all artefacts for current phase
- Tab 2 KPIs: KPI framework for active persona
- Tab 3 Gate: phase gate checklist and advance button

Colour coding:
Legacy persona: teal accent
Agentic persona: coral accent
Artefact approved: green
Artefact in progress: blue
Artefact pending: grey
Phase gate incomplete: amber
Phase gate clear: green

Routes:
/ landing — programme select or create
/programme/[id] main three-panel shell
/programme/[id]/history all artefacts with filter and search
/programme/[id]/kpis full KPI dashboard
/settings account, API keys, regulatory frameworks

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
