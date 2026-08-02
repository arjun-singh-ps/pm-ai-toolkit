# User Guide — GenAI Delivery Copilot

This guide covers what's actually usable today: both personas (Modernising Legacy Journey and
Agentic Delivery), all nine cross-cutting header agents, and accounts. For the complete agent
and artefact listing

## 1. Sign up and sign in

This is a **shared workspace** — every signed-in account sees and can act on every programme,
not just its own.

- **New here**: go to `/signup`, enter your email and a password (6+ characters), and submit.
  You'll see "Check your email for a confirmation link" — click that link to finish creating
  your account and land in the app, logged in.
- **Already have an account**: go to `/login`, enter your email and password.
- **Signing out**: click **Sign out** next to your email in the top nav. You'll be sent to
  `/login`, and every page/action requires signing in again from there.

Every page except `/login` and `/signup` requires a session — visiting any programme URL while
signed out redirects you to `/login` automatically.

## 2. Create a programme

From the homepage (`/`):

1. Under **New programme**, enter a **Programme name** (required).
2. Optionally enter a **Client**.
3. Choose a **Persona**:
   - **Modernising Legacy Journey** — for replacing or modernising an existing legacy system. Starts in Foundation phase (7 agents), then Forge (3 agents), then Amplify (6 agents).
   - **Agentic Delivery** — for building new AI-agent-based capability from scratch. Starts in Envision phase (2 agents), then Shape (3), Incubate (3), Prove (3), then Scale (4 strategic advisers).
4. Optionally tick any **Regulatory frameworks** that apply (PRA, FCA, ECB/SSM, SR 11-7, EBA
   Guidelines, DORA, ISO 42001, Client Custom). These are used by the Governance Guardian agent
   to review your artefacts — select the ones that actually apply to this programme, since
   Governance Guardian will refuse to produce generic output without at least one selected.
5. Click **Create programme**. You'll land inside the new programme automatically.

Existing programmes are listed above the form — click one to re-enter it at any time.

## 3. The programme screen layout

Once inside a programme, you'll see three panels:

- **Left sidebar**: the programme's persona and name, and the list of agents in the current
  phase. Each has a coloured dot:
  - **Grey** — locked (its dependencies aren't approved yet) or not started.
  - **Blue** — in progress (at least one draft artefact exists).
  - **Green** — complete (every artefact this agent produces is approved).
    Locked agents aren't clickable — hover over one to see exactly what it's waiting on.
- **Centre panel**: by default, shows **Programme Notes** (see §7). Click an unlocked agent in
  the sidebar to open a chat with it instead.
- **Right panel**: three tabs —
  - **Artefacts** — every artefact produced so far, with **View** (read the full content) and
    **Approve** buttons.
  - **KPIs** — KPI metrics recorded during agent conversations, grouped by lever or dimension.
    For **Legacy** programmes: Quality of Modernisation, Pace of Modernisation, AI Tool Upskill
    — captured by Delivery Intelligence, Signal Watch, and Delivery Heartbeat. For **Agentic
    Delivery** programmes: AI and Engineering Impact, People Impact, Financial Impact — captured
    by Performance Pulse. Empty until you've had a conversation with the relevant agent and
    confirmed specific numeric values with it.
  - **Gate** — a checklist of every artefact required to clear the current phase, and an
    **Advance to [next phase]** button.

At the top, **Roadmap**, **History**, and **KPIs** links open full-page views. Agent replies in
the chat area render as formatted Markdown — headings, **bold**, and bullet/numbered lists — so a
multi-part answer is easy to scan rather than one long paragraph. All nine cross-cutting header
buttons are live — see §4.1–4.9 below. They sit in two groups:

- **Programme Intelligence** (grey pills): Navigator, Persona Guide, Artefact State, KPI Monitor, AI Safety Review
- **Delivery Outputs** (coral pills): Governance Guardian, Cost Compass, Roadmap Architect, Comms Architect

## 4. Talking to an agent

1. Click an unlocked agent in the sidebar (only **Scope Sprint** is unlocked at the very start
   of a new programme — every other agent depends on the one before it).
2. Type a message describing your situation and send it (Enter sends; Shift+Enter for a new
   line).
3. The agent will typically ask clarifying questions first — answer as much as you know. If you
   don't have an answer, say so; the agent will proceed with a stated assumption rather than
   get stuck.
4. Once it has enough information, it records one or more artefacts automatically — you'll see
   a line like "📄 Recorded artefact: Programme Charter" appear in the chat.
5. You can keep chatting in the same conversation — history persists, so leaving and coming
   back later picks up exactly where you left off.

### 4.1–4.9 Cross-cutting agents — available any time, from the header

All nine header buttons open an agent chat that isn't locked behind any phase progression. Their
artefacts appear in the **Artefacts** tab and **History** like any phase agent's, but never in
the **Gate** tab — they don't block or contribute to phase progression. Each one automatically
reads the programme's existing artefacts (and, in some cases, KPI or cost data) before
responding, so you don't need to brief it on what's already been done.

#### Programme Intelligence group

#### 4.1 Navigator

Helps you understand exactly where you are in the delivery journey, what's blocking progress,
and what to work on next. Ask it things like "what should I do next?" or "why is agent X
locked?" It reads your full progress map before every response and gives grounded, specific
advice — not generic sequencing guidance. Advisory only: it produces no artefacts.

#### 4.2 Persona Guide

Helps you choose between the two delivery personas (Modernising Legacy Journey vs Agentic
Delivery), or reviews whether your current persona still fits if the nature of the work has
changed. If you've already produced artefacts, it'll tell you what a persona switch would mean
before recommending one. Produces a **Persona Recommendation** document if you need something
to take to your SteerCo sponsor.

#### 4.3 Artefact State

Produces a **Programme Status Report** — a structured, decision-ready view of every artefact
grouped by agent in phase order: what's approved, what's awaiting your review, what hasn't been
started yet, and what comes next. Use this to prepare for gate reviews or SteerCo packs.

#### 4.4 KPI Monitor

Interprets your programme's KPI data — what the numbers mean, what's moving in the wrong
direction, and what specific actions are available to respond. Ask for an overview or a focused
question ("why is human review effort still high?"). Produces a **KPI Interpretation Report**
for the PM view or SteerCo view — ask it which you need before drafting.

#### 4.5 AI Safety Review

Reviews any AI-generated artefact for safety, fairness, and regulatory compliance before you
approve it. Tell it which artefact you'd like reviewed. It will cite the regulatory frameworks
active on this programme by name, assess the artefact on six risk dimensions, and give a clear
verdict: Approved / Approved with conditions / Requires revision. Produces an **AI Safety
Review** (per artefact) and a **Guardrail Compliance Report** (programme-wide audit trail).

#### Delivery Outputs group

#### 4.6 Governance Guardian

Reviews your programme's existing artefacts against the regulatory frameworks you selected when
creating the programme, and produces a **Compliance Charter**, **Governance Pulse**, and
**Regulatory Gap Matrix**.

- If you haven't selected any regulatory frameworks, it'll ask you to add some first — you can
  add them from the programme settings screen (§7) without having to create a new programme.
- If nothing's been built yet, it'll say so and ask you to return once some artefacts exist.

#### 4.7 Cost Compass

Reviews your programme's actual AI token spend and surfaces where the budget is going. Produces
a **Cost Blueprint** (total spend by agent, plain-language interpretation, what's driving cost)
and a **Spend Signal** (spend velocity, forward projection, cost optimisation options).

- On a brand-new programme with no conversations yet, it'll tell you there's no data yet and
  explain what it will track once conversations start.
- For Legacy programmes it frames cost per agent and artefact; for Agentic Delivery it frames
  chassis vs pillar costs and cost per user.

#### 4.8 Roadmap Architect

Turns your programme's current phase state and artefacts into planning outputs for three
different audiences:

- **Horizon Map** — a phase-and-milestone timeline for the delivery team. Phase-specific: shows
  Foundation/Forge/Amplify gates and key artefacts for a Legacy programme.
- **Sprint Canvas** — a sprint-by-sprint plan derived from your active backlog artefact. If
  asked, it'll request sprint length and team capacity before drafting.
- **Stakeholder Roadmap** — a one-page executive summary: where the programme stands, what
  value has been delivered, what's coming next quarter, and what decisions are needed. No
  programme management jargon.

#### 4.9 Comms Architect

Produces stakeholder communications grounded in your actual artefact content and KPI data. It
will ask you for the current RAG status, any open decisions, and the intended distribution date
before drafting. Produces:

- **SteerCo Pack** — weekly or fortnightly. RAG status, progress, decisions needed, risks and
  issues with owners, actions from last meeting. Two to three pages maximum.
- **Board Signal** — monthly, one page. Business outcomes, value delivered, next major
  milestone, one or two key risks in business-impact terms, any board-level decisions needed.
- **Escalation Notice** — triggered by a specific condition (scope change, budget overrun,
  regulatory finding, blocked dependency). It will ask what triggered the escalation before
  drafting. Crisp and factual — not a narrative.
- **Stakeholder Bulletin** — broader team update. Non-technical, inclusive tone. What's been
  achieved, what's coming, any changes that affect the team. Suitable for email or intranet.

## 5. Reviewing and approving artefacts

1. Open the **Artefacts** tab in the right panel.
2. Each artefact shows its name, status (Draft / In progress / Approved), and version.
3. Click **View** to open the full artefact — every section, plus version, who recorded it, and
   (once approved) who approved it. **Read this before approving** — every artefact is
   explicitly AI-generated and "must be reviewed by a human before being relied upon" (this
   disclaimer is shown in the viewer, embedded in the artefact itself, not just UI chrome). You
   can also Approve directly from inside this view.
4. Click **Approve** when you're satisfied. This is permanent for that version — if the agent
   later produces revised content for the same artefact, it reverts to Draft and needs
   re-approval.
5. Once **every** artefact a locked agent depends on is approved, that agent unlocks
   automatically in the sidebar — no extra action needed.

### Have feedback on a generated artefact?

There's no separate "reject" or "request changes" button — instead, go back to that agent's
chat and just say what you want changed (e.g. "the Pilot Shortlist needs a fourth candidate" or
"reduce the timeline in the Scale Compass to 6 weeks"). The agent will produce revised content
for the same artefact name, which **bumps its version and reverts it to Draft** even if you'd
already approved the old version — so it always needs a fresh approval, and you'll never end up
approving content you haven't actually re-reviewed. Open **View** again to check the new
version before approving it.

## 6. Advancing to the next phase

Once every artefact in the current phase is approved, the **Gate** tab's checklist turns fully
green and the **Advance to [next phase]** button becomes clickable — until then, it's correctly
greyed out, and hovering it tells you exactly what's still missing. Clicking it moves the
programme into the next phase (Foundation → Forge → Amplify): the sidebar immediately updates
to show that phase's agents, with its first agent unlocked and the rest gated behind it, same
as before. This is enforced on the server, not just by the button being disabled — even if you
could somehow trigger the action early, it would be rejected with the same missing-artefacts
message.

Once a programme reaches **Amplify** (Legacy) or **Scale** (Agentic Delivery) — the final phase
of each persona — the Gate tab shows "🏁 This is the final phase of this persona." instead of
an Advance button. This is the intended end state, not a stuck gate.

**Note for Agentic Delivery**: the Scale phase is different from every other phase — its four
agents (Platform Expansion, Governance Engine, Value Sequencer, Transformation Blueprint) are
strategic advisers, not deliverable generators. They produce no fixed artefacts and the Scale
gate is always considered clear. All four are available simultaneously once Scale Readiness (the
last Prove-phase agent) is approved — use whichever is relevant to the question you're working
through.

## 7. Programme settings (Notes, Regulatory Frameworks, and Agent Mode)

Navigate to the programme's default screen (centre panel, no agent selected) to find three
editable sections:

**Programme Notes** — free text describing things like delivery methodology, regulatory
environment, or current phase context. Saved here once and automatically shared with every
agent's conversation for this programme — no need to repeat it in every chat.

**Regulatory Frameworks** — checkboxes to add or remove the compliance frameworks in scope
(PRA, FCA, ECB/SSM, SR 11-7, EBA Guidelines, DORA, ISO 42001, Client Custom). These are also
selectable at programme creation, but this is where you update them if scope changes later.
Changes take effect on the next conversation turn — Governance Guardian will use the updated
selection immediately.

**Agent Mode** — toggle switches for each monitoring agent between **Reactive** (default) and
**Proactive** (⚡). The four monitoring agents are:

| Agent              | Available |
| ------------------ | --------- |
| Signal Watch       | ✅        |
| Delivery Heartbeat | ✅        |
| Cost Compass       | ✅        |
| Performance Pulse  | ✅        |

- **Reactive** (default): the agent runs when you open it. Nothing happens automatically.
- **Proactive** (⚡): the agent gets a ⚡ badge in the sidebar and appears in a banner on
  this settings screen, reminding you to open it for its latest programme assessment. This is
  a reminder mode — the agent still only runs when you open it. A future update will add the
  scheduled trigger where the agent checks your programme automatically in the background.

A proactive agent with a ⚡ badge is prompting you: "Open me — there may be something worth
looking at." Think of it as a standing agenda item rather than an automated alarm.

Click **Save agent mode** after making changes.

## 8. Tracking progress

- **Roadmap** (top of centre panel): a timeline of every phase in your persona's journey —
  Foundation → Forge → Amplify for Legacy, or Envision → Shape → Incubate → Prove → Scale for
  Agentic Delivery. Each phase is marked **Complete**, **Current**, or **Not started**. Click a
  completed or current phase to see its agents and their artefact status, with an **Open** link
  into any unlocked agent's chat. This is read-only browsing — it never changes your programme's
  actual current phase or gate status; use the Gate tab (§6) for that.
- **History** (top of centre panel): every artefact ever produced for this programme, with a
  search box (filters by artefact name) and a status dropdown filter.
- **KPIs** (top of centre panel): the full KPI dashboard — all recorded metric values grouped
  by lever or dimension, with the most recent value per metric displayed in a tile and a trend
  badge (▲ up / ▼ down) when there's a previous value to compare against. Includes the date
  each metric was last updated. If no KPI data has been recorded yet, the dashboard shows
  which agents capture each lever/dimension and what metrics they track, so you know exactly
  where to go next.
- **Gate tab**: the fastest way to see exactly what's left before the current phase is
  considered complete.

## 9. Settings

The top-nav **Settings** link has two sections:

### MCP integrations

Connect external tools — Jira, Confluence, SharePoint, or any MCP-compatible server — so that
every agent can pull live data when generating artefacts. For example, if Jira is connected,
an agent drafting a Delivery Backlog can fetch real open tickets rather than relying solely
on what you type.

To add an integration:

1. Click **+ Add integration**.
2. Give it a name (e.g. "Our Jira"), choose its type, paste the MCP server URL, and optionally
   add an auth token (Bearer token or API key).
3. Click **Add integration**. It appears in the list immediately and is enabled by default.

Use **Disable** / **Enable** to temporarily exclude an integration without deleting it.
Use **Delete** to remove it permanently.

**One important constraint**: the MCP server URL must be publicly reachable — Anthropic's
servers connect to it, not your browser. Jira Cloud, Confluence Cloud, and SharePoint Online
work directly. An internal instance behind a corporate VPN or firewall requires a hosted proxy
or tunnel first.

### Regulatory frameworks

Lists the available compliance frameworks a programme can select at setup (PRA, FCA, DORA,
etc.). These are reference only here — they're selected per programme at creation time, and
the Governance Guardian agent uses them to review artefacts.

## Troubleshooting

- **"An agent I expect to be unlocked is still grey/locked"** — hover over it; the tooltip
  names exactly which artefacts are still missing approval.
- **"I can't find an agent's chat after navigating away"** — your conversation is saved; just
  click the agent again in the sidebar.
- **"The agent's reply seems cut off or it stopped mid-thought"** — ask it to continue; very
  long artefacts occasionally hit a response length limit, and the agent will pick back up
  cleanly on the next message rather than losing any prior progress.
