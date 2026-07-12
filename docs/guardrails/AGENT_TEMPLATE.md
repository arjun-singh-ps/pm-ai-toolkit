# Agent Guardrail Template

Every new agent definition **must** complete all four fields below before the `systemPrompt`
is written. A field that is absent, or that passes the genericness test (could be pasted
unchanged into a different agent's definition and still make sense), is treated as missing.
Submit this completed template for review alongside the agent file.

---

## Agent metadata

| Field | Value |
|-------|-------|
| **Name** | `kebab-case-slug` |
| **Display name** | Human-readable |
| **Persona** | `legacy` / `agentic` |
| **Phase** | `foundation` / `forge` / `amplify` / `envision` / `shape` / `incubate` / `prove` / `scale` / `cross-cutting` |
| **Produces** | List of artefact names |
| **Depends on** | List of agent names whose artefacts must be approved first |
| **Can record KPIs** | Yes / No — if yes, name the KPI lever(s) |
| **Can record alerts** | Yes / No |

---

## Field 1 — Never

**Requirement**: At least one specific, falsifiable prohibition. Must include a named mechanism
for detecting violation. "Never produce generic output" fails on its own; "never produce X
without citing at least one of [named list] in every section" passes.

**Genericness test**: Would this sentence make sense if pasted into a different agent's
definition? If yes, it fails.

> **[ Complete for this agent ]**
>
> Never [specific action] unless/without [named mechanism or condition].
>
> If [edge case that triggers the prohibition], [stated consequence — halt, warn, escalate].

---

## Field 2 — Always check

**Requirement**: Names the specific check AND what happens if the check fails. "Block",
"warn", and "escalate" are distinct failure modes — choose the right one. A check without a
stated failure mode is PARTIAL.

> **[ Complete for this agent ]**
>
> Before [generating / recording / producing] [specific artefact or action]:
>
> 1. Verify [check A]. If absent/failed: [failure mode — block with explanation / warn and proceed with caveats / escalate to named stakeholder].
> 2. Verify [check B]. If absent/failed: [failure mode].
> 3. [Additional checks as needed]

---

## Field 3 — Audience

**Requirement**: Names the specific role this agent's output is written for AND the decision
that output feeds into. "The programme manager" alone fails — the CFO reviewing cost exposure
and the delivery lead reviewing sprint velocity are both programme managers.

> **[ Complete for this agent ]**
>
> Primary audience: [named role, e.g. "CRO / Head of Risk", "SteerCo chair and decision-owners", "board sponsor with no delivery background"].
>
> Decision this output feeds: [specific decision, e.g. "whether the programme is compliant enough to proceed to the next phase gate", "whether the AI budget run rate is sustainable", "which departments to roll out to first"].
>
> Tone calibration: [how to pitch — technical depth / RAG-and-decisions / business outcomes only / etc.].

---

## Field 4 — Good output, specifically

**Requirement**: A concrete schema, a list of required fields per entry, or a rejection
example (a bad output described specifically enough that the difference is falsifiable).
Adjectives like "clear", "professional", "grounded" do not count. A schema with named fields
counts. A rejection example ("bad: 'to be reviewed'; good: 'Article 11 covered by X, Article
13 absent — action Y, owner Z'") counts.

> **[ Complete for this agent ]**
>
> A well-formed [artefact name] includes:
> - [Required element 1, e.g. "one row per selected regulatory framework"]
> - [Required element 2, e.g. "each row: framework name | what is covered (cite artefact) | gap | remediation action + owner"]
> - [Required element 3]
>
> A bad [artefact name] entry looks like: "[verbatim example of output that fails]"
> A good [artefact name] entry looks like: "[verbatim example of output that passes]"

---

## Banking-context non-negotiables

All agents operating in a banking context must additionally confirm:

- [ ] **Financial calculations**: any cost figure uses `Decimal` arithmetic — no floating-point accumulation
- [ ] **Regulatory reference**: any agent producing compliance, governance, or cost output cites the programme's selected frameworks (PRA / FCA / ECB·SSM / SR 11-7 / EBA / DORA / ISO 42001) by name — never generic "industry standards"
- [ ] **PII**: if the agent reads or produces content that could contain personal data, the prompt explicitly prohibits including identifiable individuals without masking
- [ ] **Data residency**: any agent referencing infrastructure or data storage notes UK/EU data residency as a default assumption unless the programme explicitly overrides it
- [ ] **AI-generated disclaimer**: all artefacts carry the automatic disclaimer; the agent must not suppress it or describe the artefact as "final" or "approved"

---

## ASI self-assessment (fill in applicable rows only)

| ASI | Category | Applicable? | Mitigation in this agent |
|-----|----------|-------------|--------------------------|
| ASI01 | Goal Hijack | Yes if agent reads external content (MCP tools, uploaded docs, other artefacts) | |
| ASI02 | Tool Misuse | Yes if agent has `record_artefact`, `record_kpi`, or `record_alert` | |
| ASI03 | Privilege Abuse | Yes if agent is cross-cutting (no phase gate) or produces compliance/financial artefacts | |
| ASI04 | Supply Chain | Yes if agent uses MCP integrations (Jira, Confluence, SharePoint) | |
| ASI05 | Code Execution | Yes if agent produces agent architecture, prompt fabric, or code-execution instructions | |
| ASI06 | Context Poisoning | Yes if agent's output is consumed as context by downstream agents | |
| ASI07 | Inter-Agent Comms | Yes if agent receives output from other agents or is a cross-cutting agent | |
| ASI08 | Cascading Failure | Yes if agent is in a gated dependency chain | |
| ASI09 | Trust Exploitation | Yes if agent produces authoritative-sounding outputs (regulatory, financial, strategic) | |
| ASI10 | Rogue Agent | Yes if agent has `canRecordAlerts: true` or can act without explicit human approval | |
