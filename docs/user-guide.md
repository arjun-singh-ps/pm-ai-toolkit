# User Guide — GenAI Delivery Copilot

> **Living document.** Update this whenever a UI flow changes — a new field, a renamed button,
> a new page. Every step below should match what's actually on screen. See the maintenance rule
> in `CLAUDE.md`.

This guide covers what's actually usable today: the Modernising Legacy Journey persona (all
three phases, 16 agents) plus accounts. For what's still aspirational, see
`docs/business-specification.md`.

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
3. Choose a **Persona**. Only **Modernising Legacy Journey** is selectable — **Agentic
   Delivery** is shown but disabled, since it isn't built yet.
4. Optionally tick any **Regulatory frameworks** that apply (PRA, FCA, ECB/SSM, SR 11-7, EBA
   Guidelines, DORA, ISO 42001, Client Custom). These are stored against the programme but
   nothing checks artefacts against them yet (the Governance Guardian agent that would do this
   isn't built).
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
  - **KPIs** — currently always empty; no agent writes KPI data yet.
  - **Gate** — a checklist of every artefact required to clear the current phase, and an
    **Advance to [next phase]** button.

At the top, **History** and **KPIs** links open full-page views of the same data, and **Project
Charter**-style cross-cutting buttons (Governance Guardian, Cost Compass, Roadmap Architect,
Comms Architect) are visible but disabled — "coming in a later milestone."

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

Once a programme reaches **Amplify** — the last phase of the Modernising Legacy Journey
persona — the Gate tab shows "🏁 This is the final phase of this persona." instead of an
Advance button. There's nowhere further to go within this persona; this is the intended end
state, not a stuck gate.

## 7. Setting programme notes

Click the programme name area or navigate to the programme's default screen (centre panel, no
agent selected) to find **Programme Notes** — free text describing things like delivery
methodology, regulatory environment, or current phase context. Anything you save here is
automatically shared with every agent's conversation for this programme, so you don't need to
repeat the same background information to each one.

## 8. Tracking progress

- **History** (top of centre panel): every artefact ever produced for this programme, with a
  search box (filters by artefact name) and a status dropdown filter.
- **Gate tab**: the fastest way to see exactly what's left before the current phase is
  considered complete.

## 9. Settings

The top-nav **Settings** link currently shows only the list of available regulatory frameworks
for reference. Account/API-key management isn't there — your account itself is managed via
sign-in/sign-out in the top nav (§1); there's no profile/password-change page yet, and no fake
functionality standing in for it.

## Troubleshooting

- **"An agent I expect to be unlocked is still grey/locked"** — hover over it; the tooltip
  names exactly which artefacts are still missing approval.
- **"I can't find an agent's chat after navigating away"** — your conversation is saved; just
  click the agent again in the sidebar.
- **"The agent's reply seems cut off or it stopped mid-thought"** — ask it to continue; very
  long artefacts occasionally hit a response length limit, and the agent will pick back up
  cleanly on the next message rather than losing any prior progress.
