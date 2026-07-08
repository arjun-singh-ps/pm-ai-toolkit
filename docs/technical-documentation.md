# Technical Documentation — GenAI Delivery Copilot

> **Living document.** Update this in the same commit as any change to architecture, data model,
> routes, or file structure. See the maintenance rule in `CLAUDE.md`.

## 1. Stack

- **Framework**: Next.js 16 (App Router), TypeScript strict mode
- **Database**: Supabase (Postgres), app logic accessed only via the service-role key, server-side
- **Auth**: Supabase Auth (email + password, email confirmation required), via `@supabase/ssr`
- **AI**: Anthropic Claude API (`claude-sonnet-4-6`), `@anthropic-ai/sdk`
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit), Playwright (E2E — see §11)
- **Decimal arithmetic**: `decimal.js` (for cost calculations — see §8)

## 2. Architecture overview

```
Browser ──fetch──> Next.js API routes ──> lib/* (data access, business logic) ──> Supabase
                                       └──> agentEngine.ts ──> Anthropic SDK ──> Claude API
```

The browser never talks to Supabase or Claude directly. Every external call is mediated by a
Next.js API route, which is the only place the service-role key and the Anthropic key are ever
read (both guarded in `src/lib/supabase.ts` and `src/lib/claude.ts` respectively — both throw
clearly if the relevant env var is missing).

**Hard rule, learned the hard way during this build**: never import a module that touches `fs`,
`process.env` secrets, or the Supabase/Anthropic SDKs from a file that also gets imported by a
`"use client"` component — the whole import chain gets bundled into the browser. This is why
`src/lib/fillTemplate.ts` (gone now, but the pattern remains) and `src/agents/registry.ts` are
deliberately pure/browser-safe, while `src/lib/supabase.ts`, `src/lib/claude.ts`,
`src/lib/agentEngine.ts`, `src/lib/gating.ts`, `src/lib/programmes.ts`, `src/lib/artefacts.ts`,
`src/lib/chatSessions.ts`, `src/lib/costRecords.ts`, `src/lib/auth.ts`, and
`src/lib/supabaseServer.ts` are server-only and must never be imported by a client component —
only by API routes or server components/layouts. `src/lib/supabaseBrowser.ts` is the deliberate
exception, built specifically to be client-safe (§5.1).

## 3. Data model

6 tables across two migration files. **RLS is enabled on all of them**, with a single `to
authenticated using (true) with check (true)` policy per table — any logged-in user, full
access, matching the shared-workspace model. This is a backstop against the now-public
anon/publishable key being used to call Supabase's REST API directly; it is **not** this
app's own access-control mechanism (see §5.2).

Migrations:
- `supabase/migrations/0001_init.sql` — original 5 tables + disabled RLS.
- `supabase/migrations/0002_enable_rls.sql` — enables RLS on all 5.
- `supabase/migrations/0003_mcp_integrations.sql` — adds the 6th table (below) with RLS
  already enabled inline.
- `supabase/migrations/0004_proactive_agents.sql` — adds `proactive_agents text[] NOT NULL
  DEFAULT '{}'` to `programmes`.

Tables:
- **`programmes`**: `id, name, client, persona, active_phase, regulatory_frameworks[], notes,
  proactive_agents[], created_at` — `proactive_agents` stores the agent names the user has
  opted into proactive mode for this programme (see §14)
- **`artefacts`**: `id, programme_id, artefact_name, phase, activity, agent_name, version,
  status (draft/in_progress/approved), content (jsonb), created_at, approved_at, approved_by`
  - `content` is structured JSON (`{ title, sections: [{heading, body}] }` plus universal fields
    `version, date, programmeName, owner, disclaimer`), not opaque text — this is a deliberate
    deviation from a vaguer original spec, chosen so the UI can render fields individually.
- **`chat_sessions`**: `id, programme_id, agent_name, phase, activity, messages (jsonb),
  created_at` — one row per (programme, agent) pair currently. `messages` stores the exact
  Anthropic `MessageParam[]` shape, replayed straight back into the next API call.
- **`kpi_snapshots`**: `id, programme_id, persona, lever_or_dimension, metric_name, value,
  recorded_at` — written via `writeKpiSnapshot` in `src/lib/kpiSnapshots.ts`, called by
  `agentEngine.ts` when it handles a `record_kpi` tool call. Three agents have `kpiLevers`
  set in their config and therefore receive the `record_kpi` tool: Delivery Intelligence,
  Signal Watch, Delivery Heartbeat (see §4 and §6).
- **`cost_records`**: `id, programme_id, agent_name, tokens_in, tokens_out, cost_usd
  (numeric(10,6)), artefact_id, created_at`.
- **`mcp_integrations`**: `id, name, type (jira|confluence|sharepoint|custom), server_url,
  auth_token (nullable, plain text for MVP), enabled, created_at` — workspace-scoped, not
  programme-scoped. Auth tokens are protected by RLS (requires authenticated session) but are
  not encrypted at rest — encrypt before production use with real API keys.

## 4. Agent architecture pattern

Agents are **plain typed config objects**, not classes — see `src/agents/types.ts`
(`AgentConfig`: name, displayName, persona, phase, systemPrompt, produces, dependsOnAgents).
Each phase-scoped agent is one small file under
`src/agents/modernisation/{foundation,forge,amplify}/`; cross-cutting agents (§4.1) live under
`src/agents/cross-cutting/` instead. All of them aggregate into a single lookup in
`src/agents/registry.ts` (`getAgent`, `listAgentsForPhase`, `FOUNDATION_AGENTS`, `FORGE_AGENTS`,
`AMPLIFY_AGENTS`, `CROSS_CUTTING_AGENTS`). The registry is the single source of truth — the
sidebar, the gating logic, and the chat API route all read agent metadata from here, never
hardcoded elsewhere.

### 4.1 Cross-cutting agents — a phase-independent variant of the same config

The first cross-cutting agent, Governance Guardian, reuses `AgentConfig` as-is rather than a
separate type — no code path needed to change. Two sentinel-like choices make this work:

- `phase: "cross-cutting"` never matches a real `programme.active_phase`, so
  `listAgentsForPhase` (and therefore the Sidebar and `isPhaseGateClear`) never returns it —
  confirmed by a dedicated test (`tests/unit/registry.test.ts`) iterating every real phase
  across both personas. **Any future "list a programme's available agents" code must filter
  `phase === "cross-cutting"` directly — never reuse `listAgentsForPhase` for that.**
- `persona: "legacy"` is a pragmatic stand-in (Agentic Delivery isn't built, so there's no real
  second case to handle yet) — conceptually this agent should be persona-agnostic, but the type
  doesn't support that today. Revisit if/when Agentic Delivery is built.
- `dependsOnAgents: []` — no gating, available the instant a programme exists. The existing
  generic chat route (`src/app/programme/[id]/agents/[agentName]/page.tsx`) needed **zero
  changes** — `canRunAgent` already returns `{allowed: true}` unconditionally for an empty
  dependency list. All four cross-cutting agents are linked from `src/components/shell/Header.tsx`
  as `Link` components (Governance Guardian, Cost Compass, Roadmap Architect, Comms Architect).

### 4.2 Portfolio-wide context — and the client-bundle trap it almost reintroduced

Cross-cutting agents need to see more than standard programme context — Governance Guardian
specifically needs the programme's existing artefacts to avoid producing generic output (rule
#10). The original plan was a `buildExtraContext` function **field on `AgentConfig` itself**,
populated per-agent. That would have been wrong: `src/agents/registry.ts` is imported directly
by `RightPanel.tsx` (a `"use client"` component, for `listAgentsForPhase`), and ES module
bundling pulls in a file's entire top-level import graph regardless of which export is actually
used — so a server-only data-fetching import (e.g. `listArtefactsForProgramme`, which touches
Supabase) sitting anywhere in `src/agents/cross-cutting/governanceGuardian.ts` would get bundled
into the browser the moment that file is reachable from the registry. This is the same class of
mistake as the original `fs`-in-client-bundle incident, just one hop further through the import
graph — caught before shipping, not after, this time.

**Actual mechanism, split across three files to keep the boundary explicit:**
- `src/agents/cross-cutting/governanceGuardian.ts` — pure `AgentConfig` metadata only. No
  Supabase/fs imports. Safe to be reachable from the client via the registry.
- `src/agents/cross-cutting/artefactSummary.ts` — pure formatting logic (`formatArtefactSummary`,
  unit-tested in `tests/unit/artefactSummary.test.ts`): sorts approved artefacts before
  drafts/in-progress (rather than excluding non-approved ones — under-inclusion was judged the
  bigger risk against rule #10, since this agent is openable before anything is approved) and
  truncates each section body to ~500 characters with an explicit `[truncated]` marker (rejected
  a headings-only-plus-fetch-tool alternative: it would let the model skim headings and go
  generic without bothering to fetch bodies, and would compete with `MAX_TOOL_ITERATIONS`, which
  is sized for `record_artefact` calls).
- `src/lib/governanceGuardianContext.ts` (server-only) — calls `listArtefactsForProgramme` +
  `formatArtefactSummary`.
- `src/lib/crossCuttingContext.ts` (server-only) — a small `agentName → builder` map, imported
  only by `src/lib/agentEngine.ts`. `runAgentTurn` calls `getExtraContext(agentName, programmeId)`
  generically and appends a non-null result to the system prompt. Currently maps all four
  cross-cutting agents: Governance Guardian → artefacts, Cost Compass → `cost_records` aggregated
  by agent using Decimal arithmetic, Roadmap Architect → artefacts, Comms Architect → artefacts
  plus KPI snapshots (fetched in parallel). Adding another cross-cutting agent means one new entry
  here and one new server-only context file — `agentEngine.ts` itself doesn't change.

### Adding a new agent
1. Create `src/agents/<persona>/<phase>/<agentName>.ts` exporting one `AgentConfig`.
2. Write its `systemPrompt` (role + artefacts it produces); append
   `COMMON_AGENT_INSTRUCTIONS` from `src/agents/sharedInstructions.ts`.
3. Set `dependsOnAgents` to the agent name(s) whose artefacts must be approved first — empty
   for the first agent of a new phase, since entering that phase already implies the previous
   phase's gate was clear (see Forge's `pilot-ignition.ts` for the pattern).
4. Add it to the relevant list in `src/agents/registry.ts`.
5. Nothing else needs to change — the chat engine, UI, gating, and approval flow are all
   agent-agnostic. This was proven during the Foundation build: agents 2–7 needed zero new code
   beyond their config files.

## 5. Authentication (`src/lib/auth.ts`, `src/lib/supabaseBrowser.ts`, `src/lib/supabaseServer.ts`, `src/proxy.ts`)

### 5.1 Three Supabase client instances, not one

- `src/lib/supabaseBrowser.ts` — `createBrowserClient`, for client-component login/signup forms.
  Uses the public anon/publishable key.
- `src/lib/supabaseServer.ts` — `createServerClient` with an **async** `cookies()` adapter (Next
  16 requires `await cookies()`), for Server Components, Route Handlers, and Server Actions.
- `src/proxy.ts` — its own `createServerClient` instance with `NextRequest`/`NextResponse`
  cookie glue, distinct from the one above (different cookie store APIs; don't try to share an
  instance between them).

All three use `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — never the
service-role key. Identity is proven by the session cookie, not by which key is used.

### 5.2 `src/proxy.ts` — the app's actual access control

Named `proxy.ts`, not `middleware.ts` — Next.js 16 renamed the convention; the exported function
is `proxy`, not `middleware` (the old name still works but logs a deprecation warning). Lives
under `src/` per this project's directory structure.

Runs on every request except static assets (`config.matcher`). Calls `await
supabase.auth.getUser()` — **not** `getSession()`, which only reads the cookie's JWT without
revalidating it against Supabase and so can be spoofed/stale. No valid user and the path isn't
`/login`, `/signup`, or `/auth/callback` → redirect to `/login` for page requests, 401 JSON for
`/api/*` requests. The classic `@supabase/ssr` middleware bug: constructing a fresh
`NextResponse.redirect(...)` loses any session cookie the Supabase client just refreshed — the
refreshed cookies must be copied onto the redirect response explicitly, which `proxy.ts` does.

**This is the real authorization boundary for this app.** RLS (§3) is a separate, secondary
backstop for a path this proxy doesn't cover — direct calls to Supabase's REST API using the
public anon key, bypassing Next.js entirely.

### 5.3 Knowing *who*, not just *whether*

`src/lib/auth.ts`'s `getCurrentUserEmail()` calls `getUser()` (again, not `getSession()`) via the
server client and returns the email or `null`. `proxy.ts` already gates *whether* a request is
authenticated; routes that need to know *who* is acting — `POST /api/agents/[agentName]/chat`,
`POST /api/artefacts/[id]/approve` — call this separately and 401 if `null`, then thread the real
email into `runAgentTurn`/`recordArtefactDraft`/`approveArtefact` (§6, §3) instead of the old
`DEFAULT_OWNER` placeholder constant, which has been deleted from `src/lib/constants.ts`.

**Known tradeoff, accepted deliberately**: the user's **email** is stored (in `approved_by` and
artefact content's `owner` field), not their Supabase Auth UUID. Human-readable, no profiles
table needed — but if a user later changes their Auth email, historical records won't follow
them. Acceptable for this product's current scope; revisit if it ever matters.

### 5.4 Email confirmation flow

Sign-up (`src/components/SignupForm.tsx`) calls `signUp()` with `emailRedirectTo` pointing at
`/auth/callback`, then shows a "check your email" message — no session exists yet, since
confirmation is required (a project setting, not something this app's code controls). Clicking
the emailed link hits `src/app/auth/callback/route.ts`, which exchanges the link's `code` for a
session (`exchangeCodeForSession`) and redirects to `/`. Sign-in (`LoginForm.tsx`) needs no
callback — `signInWithPassword()` establishes a session directly, no redirect round-trip.

Sign-out is a Server Action (`src/app/actions/auth.ts`'s `signOutAction`), invoked via a `<form
action={signOutAction}>` — deliberately a POST, never a GET/link, so prefetching can't trigger a
logout. Calls `supabase.auth.signOut()` via the server client so the cookie is actually cleared.

## 6. Chat engine (`src/lib/agentEngine.ts`)

`runAgentTurn(programmeId, agentName, userMessage, userEmail)`:
1. Looks up the agent config; refuses if unknown.
2. Calls `canRunAgent` (gating, §7); refuses with a reason if blocked.
3. Loads/creates the `chat_sessions` row, appends the user message.
4. Builds the system prompt (`buildSystemPrompt`, exported and unit-tested): programme
   name/persona/phase/client/regulatory frameworks/notes, then the agent's own brief. Appends
   `getExtraContext(agentName, programmeId)` (§4.2) if non-null — this is the only place
   cross-cutting agents' portfolio-wide context enters the conversation.
5. Fetches enabled MCP integrations (`getActiveIntegrations`). If any exist, uses
   `client.beta.messages.create` with `mcp_servers` (Anthropic beta feature, betas header
   `"mcp-client-2025-04-04"`); otherwise falls back to `client.messages.create`. The beta
   response's `BetaContentBlock[]` is cast to `ContentBlock[]` for message history replay —
   safe at runtime since `BetaContentBlock` is a superset.
6. Calls Claude with `record_artefact` and (if `agent.kpiLevers` is non-empty) `record_kpi`
   tools, looping up to `MAX_TOOL_ITERATIONS` (5) times while Claude keeps calling tools.
6. **Every `tool_use` block gets a paired `tool_result`, unconditionally**, regardless of why
   the response stopped. This is a deliberate fix for a real bug found during testing: a
   truncated response (`stop_reason: "max_tokens"`) could leave a `tool_use` block unpaired,
   which corrupts the saved history — the next call to Claude with that history is rejected
   outright. `MAX_OUTPUT_TOKENS` was also raised (2048 → 4096) to reduce how often truncation
   happens, but the unconditional pairing is the real fix, not the token bump.
7. Validates each `record_artefact` call's `artefactName` against the agent's `produces` list
   before writing anything — rejects hallucinated names with an error `tool_result`.
8. Merges universal fields (version, date, programme name, owner, disclaimer) into artefact
   content **server-side**, never trusting the model for these.
9. Persists the full message history and a `cost_records` row, every turn.

## 7. Gating (`src/lib/gating.ts`)

`canRunAgent(programmeId, agentName, fetchArtefactStatuses?)` and
`isPhaseGateClear(programmeId, persona, phase, fetchArtefactStatuses?)`. Both take an
**injectable fetch function**, defaulting to a real Supabase query — this is what makes them
unit-testable without a live database (see `tests/unit/gating.test.ts`), and is also reused by
`src/components/shell/Sidebar.tsx` to compute lock state from an already-fetched artefact list
without a duplicate query. `isPhaseGateClear` takes `phase` as a plain string, so it required
zero changes to generalize to the Forge phase — confirmed by a Forge-specific test case.

### Phase advancement (`src/app/api/programmes/[id]/advance-phase/route.ts`)

The only path allowed to change `programmes.active_phase`. The generic
`PATCH /api/programmes/[id]` route can technically still accept an `active_phase` field (no
caller uses it that way today — only `ProgrammeNotesForm` PATCHes `notes`), but only this
dedicated route re-checks the gate, so it's the only one that should ever be used for phase
transitions. Logic: look up the programme → compute the next phase via `NEXT_PHASE`
(`src/lib/constants.ts`) → reject if the next phase has no agents
(`listAgentsForPhase(...).length === 0`, which is what keeps Forge→Amplify correctly blocked) →
reject if `isPhaseGateClear` says the current phase isn't clear → otherwise update
`active_phase`. The Gate tab button in `RightPanel.tsx` mirrors this client-side (label and
enabled state) purely for UX — the server-side check is what's actually load-bearing.

Amplify is the last phase of this persona, so `NEXT_PHASE` has no `"amplify"` key at all —
distinct from Forge's case, where `NEXT_PHASE["forge"] = "amplify"` exists but resolved to zero
agents at the time. `RightPanel.tsx` distinguishes the two: `nextPhase === undefined` renders a
static "final phase" message instead of a disabled button, so the UI reads as an intentional
end state rather than a stuck one. This is a client-only copy branch — the route's logic was
already correct for both cases (a missing key and an empty agent list both fail the same
`if (!nextPhase || ...)` check) and needed no change.

## 8. Cost tracking (`src/lib/cost.ts`)

`calculateCostUsd(tokensIn, tokensOut)` uses `decimal.js`, never floating point, per the "all
financial calculations use Decimal" rule. **The per-million-token prices ($3 input / $15 output)
are approximate and must be verified against Anthropic's current pricing page** before these
figures are used for real spend reporting.

## 9. API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/programmes` | GET, POST | List / create programmes |
| `/api/programmes/[id]` | GET, PATCH | Fetch one programme / update notes, regulatory_frameworks, proactive_agents (PATCH should not be used to change active_phase — see §7.1) |
| `/api/programmes/[id]/advance-phase` | POST | Gate-enforced phase transition — the only path allowed to change active_phase |
| `/api/agents/[agentName]/chat` | POST | Run one chat turn (the only path to `agentEngine.ts`); 401s without a session (§5.3) |
| `/api/agents/[agentName]/session` | GET | Fetch display-ready chat history for hydrating the UI |
| `/api/artefacts` | GET | List artefacts for a programme |
| `/api/artefacts/[id]` | GET | Fetch one artefact's full content |
| `/api/artefacts/[id]/approve` | POST | Explicit human approval action; 401s without a session (§5.3) |
| `/api/gate/[phase]` | GET | Phase-gate checklist (every agent's artefacts + approved flag) |
| `/api/kpis` | GET | KPI snapshots for a programme (`?programmeId=`), most recent first |
| `/auth/callback` | GET | Exchanges an email-confirmation code for a session (§5.4) |

All four cross-cutting agents needed **no new routes** — `/api/agents/[agentName]/chat` and
`/api/agents/[agentName]/session` are already generic by agent name (§4.1). The header buttons
are all live `Link` components pointing to the standard agent route.

## 10. UI structure

`src/app/layout.tsx` is now **async** — it reads the current session (`getCurrentUserEmail`) to
show the logged-in user's email and a sign-out form in the top nav, rendering neither on the
public `/login`/`/signup` pages (no session exists there). `src/app/programme/[id]/layout.tsx`
renders the three-panel shell (`Sidebar`, `Header`, `RightPanel`) around every route under it.
`Sidebar` is an **async server component** — it fetches artefact/gate status itself, which is
why it can't be a client component (would pull Supabase access into the browser bundle).
`RightPanel` is a client component fetching its own data via the API routes above (Artefacts tab
live, including `ArtefactModal` — a full-content viewer with an Approve action, added after the
auth build surfaced that there was previously no way to actually read an artefact before
approving it; Gate tab live; KPIs tab an honest empty state). Agent chat lives at
`src/app/programme/[id]/agents/[agentName]/page.tsx` — one generic route for every agent, gated
server-side by `canRunAgent` before rendering `ChatPanel`.

**Bug fixed during the Governance Guardian build, affecting every agent, not just that one**:
`ChatPanel` and `RightPanel` are sibling client components with no direct prop path between them
(both are children of the server-component layout). Recording an artefact via chat never told
`RightPanel` to refetch, so a newly recorded artefact was invisible in the Artefacts/Gate tabs
until the page was manually reloaded — only the explicit Approve flow (which calls its own
`loadData()` directly) updated immediately. Fixed with a small browser event,
`ARTEFACT_RECORDED_EVENT` (`src/lib/clientEvents.ts`): `ChatPanel` dispatches it on `window` after
any `recordedArtefacts.length > 0` (and also calls `router.refresh()`, so the Sidebar's
server-rendered lock/status dots update too); `RightPanel` listens for it and calls its own
`loadData()`. No state library needed for one signal between two siblings.

## 11. Testing

### Unit tests (`npm test`)

Runs Vitest over `tests/unit/**/*.test.ts` — no live Supabase or Claude calls. Covers:
`registry.ts` lookups (including that cross-cutting agents never leak into `listAgentsForPhase`
for any real phase/persona combination), `gating.ts`'s dependency/gate logic (injected fake
data), `cost.ts`'s decimal arithmetic, `agentEngine.ts`'s `buildSystemPrompt`, and
`artefactSummary.ts`'s `formatArtefactSummary` (truncation, status-ordering, empty-state).

### E2E tests (`npm run test:e2e`)

Playwright suite in `tests/e2e/`. Requires `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` in
`.env.local` (a real Supabase user in the project).

- `tests/e2e/global.setup.ts` — runs once before all specs: logs in via the real login form,
  saves the authenticated session to `tests/e2e/.auth/session.json`. All subsequent specs reuse
  that session via `storageState`.
- `tests/e2e/helpers/seed.ts` — creates and deletes test programmes and artefacts directly via
  the Supabase service client (no Claude, no Next.js API). Test programmes are named
  `[E2E] ...` so they can be bulk-deleted without touching real data. Never imports from `@/`
  — it runs in the Playwright process, not in Next.js.
- `tests/e2e/auth.spec.ts` — authenticated home page, Settings nav, sign out → `/login`.
- `tests/e2e/legacy-journey.spec.ts` — seeds all 14 Foundation artefacts as approved, then
  exercises: sidebar renders Foundation phase, all 4 cross-cutting header links present, Gate
  tab shows clear, Advance to Forge button works, programme advances to forge phase, Artefacts
  tab lists seeded items.

**Key design constraint**: Claude API calls happen server-side inside Next.js; `page.route()`
cannot intercept them. The E2E suite bypasses Claude entirely by seeding artefacts directly
via the service client — it exercises the real gate/phase-advance logic without touching the
AI layer. `npm run lint` and `npm run build` run after every change as a correctness gate (the
build step has caught real server/client boundary mistakes during this project).

## 12. Environment variables (`.env.local`, never committed)

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to expose to the browser —
that's their purpose, and what makes client-side Supabase Auth calls possible. They replace the
old server-only `SUPABASE_URL` (same value, renamed — the URL itself was never sensitive, so one
name instead of two avoids drift). `SUPABASE_SERVICE_ROLE_KEY` remains server-only and must never
be exposed.

## 13. Proactive agent architecture

### 13.1 What the feature is

Four agents in the system have a design brief that implies monitoring rather than pure
conversation: **Signal Watch** (Forge), **Delivery Heartbeat** (Amplify), **Cost Compass**
(cross-cutting), and **Performance Pulse** (Agentic Delivery/Prove — not yet built). Per the
product's reactive/proactive categorisation (see Business Specification §10), they are currently
*monitoring-reactive* — designed to watch for signals, but only running when the user opens them.

The proactive agent feature lets users set each of these agents to **proactive mode** per
programme. The preference is persisted and displayed — the trigger infrastructure (see §13.3)
is a separate future build.

### 13.2 Data model

`programmes.proactive_agents text[] NOT NULL DEFAULT '{}'`

Stores the `agentConfig.name` values (e.g. `["signal-watch", "cost-compass"]`) for agents the
user has opted into proactive mode for this specific programme. Added in migration
`0004_proactive_agents.sql`. Editable via the existing `PATCH /api/programmes/[id]` route — the
same pattern as `regulatory_frameworks`.

`MONITORING_AGENTS` in `src/lib/constants.ts` defines the authoritative list:

```typescript
export const MONITORING_AGENTS: { name: string; displayName: string; built: boolean }[] = [
  { name: "signal-watch",       displayName: "Signal Watch",       built: true  },
  { name: "delivery-heartbeat", displayName: "Delivery Heartbeat", built: true  },
  { name: "cost-compass",       displayName: "Cost Compass",       built: true  },
  { name: "performance-pulse",  displayName: "Performance Pulse",  built: false },
];
```

`built: false` entries are shown in the toggle UI but disabled — the user can see what's coming
without being able to select it.

### 13.3 Current implementation vs full proactive behaviour

**What's built today:**
- `proactive_agents` stored per programme (migration `0004`).
- `ProactiveAgentsForm.tsx` — checkbox toggle for each monitoring agent (built ones active, not-yet-built ones disabled). Identical pattern to `ProgrammeFrameworksForm.tsx`: client component, `PATCH /api/programmes/[id]`, `router.refresh()`.
- **Sidebar indicator** (`Sidebar.tsx`): agents in `programme.proactive_agents` display a `⚡` badge next to their name and dot — a visual reminder that they're in proactive mode.
- **Programme home screen banner** (`src/app/programme/[id]/page.tsx`): if any proactive agents are set, lists them with a "These agents are in proactive mode — open them to see their latest assessment" note.

**What proactive mode does NOT do yet:**
- No scheduled trigger. The agents still only run when the user opens them.
- No threshold logic. No alert fires when sprint velocity drops or spend exceeds a budget.
- No notification channel. No email, no in-app badge counted without a user visiting.

**What full proactive behaviour requires (design spec, not yet built):**

| Requirement | Design |
|---|---|
| **Scheduled trigger** | A cron job (e.g. Google Cloud Scheduler → Cloud Run job, or Supabase Edge Function with `pg_cron`) that calls `runAgentTurn` once per day per programme that has that agent in `proactive_agents`. The trigger message would be a synthetic `PROACTIVE_CHECK_MARKER` (analogous to `WELCOME_INIT_MARKER` in `constants.ts`) so the agent knows it's been triggered by the scheduler, not a human, and should open with a triage summary rather than a question. |
| **Threshold configuration** | A `programme_thresholds` table (or a jsonb column on `programmes`) storing per-agent threshold values: e.g. velocity drop percentage for Signal Watch, budget cap for Cost Compass. The agent's system prompt includes the threshold when triggered, so the model can determine whether the check is worth escalating. |
| **Notification channel** | An `agent_alerts` table (programme_id, agent_name, summary, triggered_at, dismissed_at). The programme shell's home screen polls this and shows a dismissible alert card for each unread entry. Email notification is a second-order concern. |
| **Deduplification** | The trigger must not produce a new chat turn if the agent's last proactive check was within N hours, to avoid cost blowout on programmes with many proactive agents. |

### 13.4 Why the toggle is worth shipping before the trigger

From a programme management perspective: knowing which agents you *want* to watch for you is a
decision worth recording now. When the trigger infrastructure is built, no user action is
needed — the scheduler reads `proactive_agents` and starts running. The toggle is the user's
configuration surface; the cron is the execution engine. Building the toggle first also makes
the intent visible in the UI, which gives users and stakeholders a concrete picture of what
"proactive" will mean for their programme.

## 14. Known technical debt

- Cost pricing constants are placeholders (§8).
- `dependsOnAgents` for the Foundation, Forge, and Amplify phases is a simplifying linear-chain
  assumption (each agent depends only on the one immediately before it), not derived from any
  explicit cross-agent dependency analysis in the original product brief.
- `approved_by`/artefact `owner` store the user's **email**, not their Supabase Auth UUID
  (§5.3) — simple and human-readable, but won't follow a user if they change their Auth email
  later. Accepted tradeoff, not a bug.
- RLS policies are a rubber stamp ("authenticated = full access"), not real per-user
  authorization — intentional for the shared-workspace model (§5.2), but anyone building
  per-user permissions later must not assume RLS is already doing any of that work.
