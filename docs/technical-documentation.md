# Technical Documentation — GenAI Delivery Copilot

> **Living document.** Update this in the same commit as any change to architecture, data model,
> routes, or file structure. See the maintenance rule in `CLAUDE.md`.

## 1. Stack

- **Framework**: Next.js 16 (App Router), TypeScript strict mode
- **Database**: Supabase (Postgres), accessed only via the service-role key, server-side
- **AI**: Anthropic Claude API (`claude-sonnet-4-6`), `@anthropic-ai/sdk`
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit only — no Playwright/E2E yet)
- **Decimal arithmetic**: `decimal.js` (for cost calculations — see §7)

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
`src/lib/chatSessions.ts`, and `src/lib/costRecords.ts` are server-only and must never be
imported by a client component — only by API routes or server components/layouts.

## 3. Data model

5 tables, defined in `supabase/migrations/0001_init.sql`. RLS is **disabled on all of them** —
there is no auth yet, so all access is mediated by the service-role key inside API routes. This
must be revisited once Supabase Auth is added (RLS policies keyed on `auth.uid()`).

- **`programmes`**: `id, name, client, persona, active_phase, regulatory_frameworks[], notes,
  created_at`
- **`artefacts`**: `id, programme_id, artefact_name, phase, activity, agent_name, version,
  status (draft/in_progress/approved), content (jsonb), created_at, approved_at, approved_by`
  - `content` is structured JSON (`{ title, sections: [{heading, body}] }` plus universal fields
    `version, date, programmeName, owner, disclaimer`), not opaque text — this is a deliberate
    deviation from a vaguer original spec, chosen so the UI can render fields individually.
- **`chat_sessions`**: `id, programme_id, agent_name, phase, activity, messages (jsonb),
  created_at` — one row per (programme, agent) pair currently. `messages` stores the exact
  Anthropic `MessageParam[]` shape, replayed straight back into the next API call.
- **`kpi_snapshots`**: `id, programme_id, persona, lever_or_dimension, metric_name, value,
  recorded_at` — schema exists, nothing writes to it yet.
- **`cost_records`**: `id, programme_id, agent_name, tokens_in, tokens_out, cost_usd
  (numeric(10,6)), artefact_id, created_at`.

## 4. Agent architecture pattern

Agents are **plain typed config objects**, not classes — see `src/agents/types.ts`
(`AgentConfig`: name, displayName, persona, phase, systemPrompt, produces, dependsOnAgents).
Each agent is one small file under `src/agents/modernisation/foundation/` or
`src/agents/modernisation/forge/`, aggregated into a single lookup in `src/agents/registry.ts`
(`getAgent`, `listAgentsForPhase`,
`FOUNDATION_AGENTS`, `FORGE_AGENTS`). The registry is the single source of truth — the sidebar,
the gating logic, and the chat API route all read agent metadata from here, never hardcoded
elsewhere.

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

## 5. Chat engine (`src/lib/agentEngine.ts`)

`runAgentTurn(programmeId, agentName, userMessage)`:
1. Looks up the agent config; refuses if unknown.
2. Calls `canRunAgent` (gating, §6); refuses with a reason if blocked.
3. Loads/creates the `chat_sessions` row, appends the user message.
4. Builds the system prompt (`buildSystemPrompt`, exported and unit-tested): programme
   name/persona/phase/client/regulatory frameworks/notes, then the agent's own brief.
5. Calls Claude with a shared `record_artefact` tool, looping up to `MAX_TOOL_ITERATIONS` (5)
   times while Claude keeps calling the tool.
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

## 6. Gating (`src/lib/gating.ts`)

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

## 7. Cost tracking (`src/lib/cost.ts`)

`calculateCostUsd(tokensIn, tokensOut)` uses `decimal.js`, never floating point, per the "all
financial calculations use Decimal" rule. **The per-million-token prices ($3 input / $15 output)
are approximate and must be verified against Anthropic's current pricing page** before these
figures are used for real spend reporting.

## 8. API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/programmes` | GET, POST | List / create programmes |
| `/api/programmes/[id]` | GET, PATCH | Fetch one programme / update notes, regulatory_frameworks (PATCH should not be used to change active_phase — see §6.1) |
| `/api/programmes/[id]/advance-phase` | POST | Gate-enforced phase transition — the only path allowed to change active_phase |
| `/api/agents/[agentName]/chat` | POST | Run one chat turn (the only path to `agentEngine.ts`) |
| `/api/agents/[agentName]/session` | GET | Fetch display-ready chat history for hydrating the UI |
| `/api/artefacts` | GET | List artefacts for a programme |
| `/api/artefacts/[id]` | GET | Fetch one artefact's full content |
| `/api/artefacts/[id]/approve` | POST | Explicit human approval action |
| `/api/gate/[phase]` | GET | Phase-gate checklist (every agent's artefacts + approved flag) |

No routes exist yet for the cross-cutting agents (Governance Guardian, Cost Compass, Roadmap
Architect, Comms Architect) — their header buttons are `disabled` with a tooltip, deliberately
not dead links.

## 9. UI structure

`src/app/programme/[id]/layout.tsx` renders the three-panel shell (`Sidebar`, `Header`,
`RightPanel`) around every route under it. `Sidebar` is an **async server component** — it
fetches artefact/gate status itself, which is why it can't be a client component (would pull
Supabase access into the browser bundle). `RightPanel` is a client component fetching its own
data via the API routes above (Artefacts tab live; Gate tab live; KPIs tab an honest empty
state). Agent chat lives at `src/app/programme/[id]/agents/[agentName]/page.tsx` — one generic
route for every agent, gated server-side by `canRunAgent` before rendering `ChatPanel`.

## 10. Testing

`npm test` runs Vitest over `tests/unit/**/*.test.ts` only — no live Supabase or Claude calls.
Currently covers: `registry.ts` lookups, `gating.ts`'s dependency/gate logic (injected fake data),
`cost.ts`'s decimal arithmetic, `agentEngine.ts`'s `buildSystemPrompt`. Full conversational flows,
real Supabase round-trips, and visual/colour-coding checks are verified manually against the live
dev server and real Supabase project — not automated. `npm run lint` and `npm run build` are run
after every change as a correctness gate (the build step has caught real server/client boundary
mistakes during this project).

## 11. Environment variables (`.env.local`, never committed)

```
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

No `NEXT_PUBLIC_*` Supabase variables exist or should be added until real auth requires
browser-side Supabase access — currently all DB access is server-only via the service-role key.

## 12. Known technical debt

- No auth — `DEFAULT_OWNER` constant (`src/lib/constants.ts`) stands in for a real user.
  Migrating to real auth means swapping this constant for `session.user.id` and re-enabling RLS.
- Cost pricing constants are placeholders (§7).
- `dependsOnAgents` for the Foundation and Forge phases is a simplifying linear-chain
  assumption (each agent depends only on the one immediately before it), not derived from any
  explicit cross-agent dependency analysis in the original product brief.
