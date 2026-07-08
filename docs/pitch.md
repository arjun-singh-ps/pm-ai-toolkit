# GenAI Delivery Copilot — Product Pitch

> Built for banking programme managers who know delivery inside out but shouldn't have to
> spend half their week writing the same documents again. Every feature described here is
> live and working in production today.

---

## The problem

A banking programme manager running a legacy modernisation spends a disproportionate amount
of time producing governance documents — charters, blueprints, backlogs, status reports,
SteerCo packs — that follow the same structure every time but demand fresh, programme-specific
content. That content exists in conversations, meetings, and the PM's head. The bottleneck
is the translation: getting it out and into a reviewable format, quickly enough to be useful.

At the same time, regulators expect traceability. Every artefact needs a version, an owner,
a date, a review trail. Producing them informally is risk.

---

## What this is

An AI-powered delivery copilot, built on the Anthropic Claude API. It walks a banking
programme through a structured delivery journey — one phase at a time, one specialist agent
at a time — interviewing the programme manager conversationally and producing named, versioned
artefacts that a human must explicitly approve before they count.

**Nothing is final until you approve it. Nothing is invented — only what you tell it.**

---

## The delivery journey — Modernising Legacy (fully built)

Three phases, 16 specialist agents, 29 named artefacts. Each agent unlocks only when the
previous agent's artefacts are approved. Each phase advances only when every artefact in it
is signed off.

### Phase 1 — Foundation

Establishes the programme before any technical work begins. Seven agents, run in order:

| Agent | Artefacts produced | What it does |
|---|---|---|
| **Scope Sprint** | Programme Charter, Pilot Shortlist, Value Scorecard | Defines objectives, scope, sponsor structure, candidate pilots, and the value case |
| **Estate Mapping** | Modernisation Blueprint, Delivery Compass | Maps the current technical estate and the path through it |
| **Infrastructure Blueprint** | Platform Readiness Report | Assesses whether the target platform is ready to receive modernised components |
| **Knowledge Forge** | Intelligence Fabric | Captures the institutional knowledge the AI agents need to work on this specific programme |
| **Backlog Architecture** | Delivery Backlog | Sequences the modernisation work into a prioritised, delivery-ready backlog |
| **Delivery Intelligence** | Command Centre, Signal Engine, Quality Covenant | Sets up reporting cadence, leading indicators, and the team's quality commitment |
| **Launch Readiness** | Forge Charter, Crew Blueprint, Forge Compass | Confirms the programme is ready to move from planning into active pilot delivery |

**Phase gate**: all 14 Foundation artefacts must be approved before Forge unlocks.
Gate is enforced server-side — not just a disabled button.

---

### Phase 2 — Forge

Runs the pilot and proves it works. Three agents:

| Agent | Artefacts produced | What it does |
|---|---|---|
| **Pilot Ignition** | Pilot Intelligence Pack, Steel Thread Proof, Adoption Accelerator | Runs the first real end-to-end pilot build and proves it on a thin slice of functionality |
| **Signal Watch** | Intelligence Pulse | Monitors the live pilot for early warning signs before they become real problems |
| **Scale Blueprint** | Scale Compass, Operations Playbook | Defines how to scale what's been proven into full delivery |

**Phase gate**: 6 Forge artefacts approved before Amplify unlocks.

---

### Phase 3 — Amplify

Scales what's been proven. Six agents:

| Agent | Artefacts produced | What it does |
|---|---|---|
| **Backlog Pulse** | Living Backlog | Re-prioritises the backlog based on what the pilot actually taught us |
| **Context Flywheel** | Evolving Intelligence Fabric | Keeps the AI's programme knowledge current as delivery evolves |
| **Factory Build** | Experience Blueprints, Modernised Service Catalogue | Designs the scaled delivery factory and the new service catalogue |
| **Launch Runway** | Quality Gate Report, Launch Playbook | Confirms quality gates are met and governs each capability launch |
| **Delivery Heartbeat** | Delivery Signal Report, Deployment Covenant, Live Pulse Monitor | Continuous monitoring across everything live — not just the latest launch |
| **Evolution Engine** | Capability Evolution Plan | Charts the programme's next horizon once initial modernisation is complete |

**This is the programme's end state.** The Gate tab shows a final-phase notice, not a stuck button.

---

## How every agent conversation works

1. Open the agent from the sidebar (locked agents show exactly what they're waiting for).
2. The agent opens with a **contextual welcome briefing** — it reads everything already built
   for this programme and tells you what it already knows, what it's about to do, and what it
   needs from you.
3. You have a real conversation. The agent asks clarifying questions; if you skip something,
   it warns you of the delivery risk, proceeds with a stated assumption, and flags the gap in
   the artefact content — it never refuses to continue.
4. When it has enough information, it records the artefact automatically using a tool call.
   You see "📄 Recorded artefact: [name]" in the chat.
5. The artefact appears in the **Artefacts tab** immediately — no page reload.
6. Click **View** to read the full artefact content before approving. Every artefact carries
   an AI-generated disclaimer and records who approved it and when.
7. Click **Approve**. The artefact is locked. The next agent unlocks if dependencies are met.

Your conversation history is saved. Leave and come back — it picks up exactly where you left off.

---

## Cross-cutting agents — available at any time

Four agents accessible from the header on any programme, regardless of phase. They read the
programme's existing artefacts before responding — no briefing needed.

| Agent | Artefacts produced | What it does |
|---|---|---|
| **Governance Guardian** | Compliance Charter, Governance Pulse, Regulatory Gap Matrix | Reviews every artefact against the regulatory frameworks selected for this programme. References specific artefact content — never produces generic boilerplate. If no frameworks are selected, it says so and asks you to add some. |
| **Cost Compass** | Cost Blueprint, Spend Signal | Shows where the AI budget is going: spend by agent, spend velocity, forward projection at current run rate, and optimisation options. Tracks cost per agent and artefact for Legacy. |
| **Roadmap Architect** | Horizon Map, Sprint Canvas, Stakeholder Roadmap | Three outputs for three audiences: a delivery-team phase timeline, a sprint-by-sprint plan from the active backlog, and a one-page executive summary (business outcomes only, no jargon). |
| **Comms Architect** | SteerCo Pack, Board Signal, Escalation Notice, Stakeholder Bulletin | Four stakeholder communications, each for a distinct audience and cadence. The SteerCo Pack and Board Signal are grounded in actual artefact content — not templates filled with generic language. |

---

## Regulatory framework support

Select from eight frameworks at programme creation:
**PRA, FCA, ECB/SSM, SR 11-7, EBA Guidelines, DORA, ISO 42001, Client Custom.**

Frameworks can be **edited at any time** from the programme screen — scope changes are common
in regulated environments. Governance Guardian picks up the updated selection on the next
conversation turn.

---

## KPI capture — built into delivery conversations

Three agents record real metrics during their conversations, covering the full Legacy KPI framework:

| KPI lever | Agent | Metrics captured |
|---|---|---|
| **Quality of Modernisation** | Delivery Intelligence (Foundation) | Code Coverage (%), Max Open Vulnerabilities, Documentation Accuracy (%) |
| **Pace of Modernisation** | Signal Watch (Forge) | Code Conversion Outcomes (%), Human-in-Loop Review Effort (hrs/artefact), Context Enrichment Time (hrs/sprint), Iterations to Accepted Output |
| **AI Tool Upskill** | Delivery Intelligence (Foundation) | Time to Understand Tool Components (hrs), Time to Understand Agent Outcomes (hrs) |
| All three levers updated | Delivery Heartbeat (Amplify) | All of the above, refreshed with current actuals |

Metrics appear in the **KPIs tab** of the right panel, grouped by lever, showing the most
recent confirmed value for each metric. The PM confirms every figure — no values are invented.

---

## MCP integrations — connect your live data

Connect Jira, Confluence, SharePoint, or any MCP-compatible server in **Settings**. Enabled
integrations are automatically available to every agent during every conversation. Claude can
fetch real Jira tickets, read Confluence pages, or query any tool with an MCP endpoint
mid-conversation — without the PM copying and pasting anything.

> Constraint: MCP server URLs must be publicly reachable. Internal instances behind a corporate
> VPN need a hosted proxy.

---

## Programme notes

Free text shared with every agent's context for this programme — delivery methodology,
regulatory environment, team structure, constraints. Set once, available everywhere. No need
to re-brief each agent on the basics.

---

## Artefact history

Every artefact ever produced for a programme, searchable by name and filterable by status
(Draft / In progress / Approved). Full structured content visible at any time via the History
page — not just the current version.

---

## Accounts and workspace

Real accounts (email + password, email confirmation required). **Shared workspace model:**
every signed-in user sees and can act on every programme — no per-user silos. Right for
delivery teams working together on the same programme, not for siloing individual work.

---

## Security and infrastructure

- Deployed on **Google Cloud Run** (europe-west2 region). Scales to zero; no idle cost.
- Secrets (Anthropic API key, Supabase service role key) stored in **Google Secret Manager**
  — never in environment variables or code.
- Database on **Supabase** (Postgres). Row Level Security enabled on all tables.
- The browser never talks to Supabase or Claude directly — every external call goes through
  the Next.js API layer.
- All financial calculations use **Decimal arithmetic** (never floating point).
- All AI outputs carry an explicit AI-generated disclaimer and must be human-approved before
  they count toward anything.

---

## What's built vs. what's next

| Capability | Status |
|---|---|
| Modernising Legacy Journey — Foundation, Forge, Amplify | ✅ Complete |
| Governance Guardian | ✅ Complete |
| Cost Compass | ✅ Complete |
| Roadmap Architect | ✅ Complete |
| Comms Architect | ✅ Complete |
| KPI capture (3 levers, 3 agents) | ✅ Complete |
| Regulatory framework editing | ✅ Complete |
| MCP integrations (Jira, Confluence, SharePoint, custom) | ✅ Complete |
| Multi-user shared workspace with auth | ✅ Complete |
| Cloud Run deployment | ✅ Complete |
| **Agentic Delivery persona** (Envision → Shape → Incubate → Prove → Scale) | 🔲 Next |
| Responsible AI cross-cutting agent | 🔲 Planned |

---

## Technology

Next.js 16 (App Router) · TypeScript strict mode · Supabase (Postgres + Auth) ·
Anthropic Claude Sonnet · Tailwind CSS · Google Cloud Run · Google Secret Manager

---

*Produced by GenAI Delivery Copilot. AI-generated — review before relying on this content.*
