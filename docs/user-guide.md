# User Guide — GenAI Delivery Copilot

> **Living document.** Update this whenever a UI flow changes — a new field, a renamed button,
> a new page. Every step below should match what's actually on screen. See the maintenance rule
> in `CLAUDE.md`.

This guide covers what's actually usable today: the Modernising Legacy Journey persona's
Foundation phase, with its 7 agents. For what's still aspirational, see
`docs/business-specification.md`.

## 1. Create a programme

From the homepage (`/`):

1. Under **New programme**, enter a **Programme name** (required).
2. Optionally enter a **Client**.
3. Choose a **Persona**. Only **Modernising Legacy Journey** is selectable — **Agentic
   Delivery** is shown but disabled, since it isn't built yet.
4. Optionally tick any **Regulatory frameworks** that apply (PRA, FCA, ECB/SSM, SR 11-7, EBA
   Guidelines, DORA, ISO 42001, Client Custom). These are stored against the programme but
   nothing checks artefacts against them yet (the Governance Guardian agent that would do this
   isn't built).
5. Click **Create programme**. You'll land inside the new programme automatically.

Existing programmes are listed above the form — click one to re-enter it at any time.

## 2. The programme screen layout

Once inside a programme, you'll see three panels:

- **Left sidebar**: the programme's persona and name, and the list of agents in the current
  phase. Each has a coloured dot:
  - **Grey** — locked (its dependencies aren't approved yet) or not started.
  - **Blue** — in progress (at least one draft artefact exists).
  - **Green** — complete (every artefact this agent produces is approved).
  Locked agents aren't clickable — hover over one to see exactly what it's waiting on.
- **Centre panel**: by default, shows **Programme Notes** (see §5). Click an unlocked agent in
  the sidebar to open a chat with it instead.
- **Right panel**: three tabs —
  - **Artefacts** — every artefact produced so far, with an **Approve** button on anything not
    yet approved.
  - **KPIs** — currently always empty; no agent writes KPI data yet.
  - **Gate** — a checklist of every artefact required to clear the current phase, and a
    permanently disabled **Advance to Forge** button (the next phase doesn't exist yet, so this
    correctly never enables).

At the top, **History** and **KPIs** links open full-page views of the same data, and **Project
Charter**-style cross-cutting buttons (Governance Guardian, Cost Compass, Roadmap Architect,
Comms Architect) are visible but disabled — "coming in a later milestone."

## 3. Talking to an agent

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

## 4. Reviewing and approving artefacts

1. Open the **Artefacts** tab in the right panel.
2. Each artefact shows its name, status (Draft / In progress / Approved), and version.
3. **Read the content before approving** — every artefact is explicitly AI-generated and
   "must be reviewed by a human before being relied upon" (this disclaimer is embedded in the
   artefact itself, not just UI chrome).
4. Click **Approve** when you're satisfied. This is permanent for that version — if the agent
   later produces revised content for the same artefact, it reverts to Draft and needs
   re-approval.
5. Once **every** artefact a locked agent depends on is approved, that agent unlocks
   automatically in the sidebar — no extra action needed.

## 5. Setting programme notes

Click the programme name area or navigate to the programme's default screen (centre panel, no
agent selected) to find **Programme Notes** — free text describing things like delivery
methodology, regulatory environment, or current phase context. Anything you save here is
automatically shared with every agent's conversation for this programme, so you don't need to
repeat the same background information to each one.

## 6. Tracking progress

- **History** (top of centre panel): every artefact ever produced for this programme, with a
  search box (filters by artefact name) and a status dropdown filter.
- **Gate tab**: the fastest way to see exactly what's left before the current phase is
  considered complete.

## 7. Settings

The top-nav **Settings** link currently shows only the list of available regulatory frameworks
for reference. Account and API-key management will appear here once login is added — there's no
fake functionality in the meantime.

## Troubleshooting

- **"An agent I expect to be unlocked is still grey/locked"** — hover over it; the tooltip
  names exactly which artefacts are still missing approval.
- **"I can't find an agent's chat after navigating away"** — your conversation is saved; just
  click the agent again in the sidebar.
- **"The agent's reply seems cut off or it stopped mid-thought"** — ask it to continue; very
  long artefacts occasionally hit a response length limit, and the agent will pick back up
  cleanly on the next message rather than losing any prior progress.
