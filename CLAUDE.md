# PM AI Toolkit — Claude Code Context

## What this project is
An AI-assisted delivery toolkit for banking programme managers at UK tier-1 banks.
It generates, stores, and manages prompts for governance, risk, reporting, and agile
delivery artefacts. Built with Next.js, TypeScript, Supabase, and the Anthropic Claude API.

## My background
- 18 years programme management experience across LBG, ION Trading, HCL
- Currently Senior TPM at Publicis Sapient embedded at Lloyds Banking Group
- Deep experience: Thought Machine Vault, GCP, microservices, GraphQL, consumer banking
- Learning to code — treat me as an expert PM but a beginner developer
- Familiar with: Next.js basics, Supabase, React (built SpellQuest, an 11+ app)

## How to help me
- Always explain WHY before HOW — I need to understand the concept, not just copy commands
- Show the full file path when creating or editing files
- When suggesting code, tell me which file it goes in and where in the file
- Flag when something is a beginner trap or a common mistake
- Use banking/programme management analogies when explaining technical concepts
- If I ask for something that has a better approach, tell me — don't just do what I asked

## Project tech stack
- Framework: Next.js 14 App Router (TypeScript)
- Database: Supabase (Postgres + pgvector for RAG)
- AI: Anthropic Claude API (claude-sonnet-4-6)
- Styling: Tailwind CSS
- Testing: Vitest (unit), Playwright (E2E)
- Deploy: Vercel (frontend), Supabase (DB)
- Auth: Supabase Auth

## Project structure
pm-ai-toolkit/
├── CLAUDE.md                  ← you are here
├── README.md
├── .env.local                 ← secrets, never commit this
├── .gitignore
├── prompts/                   ← raw prompt library (markdown)
│   └── raid-log.md
├── src/
│   ├── app/                   ← Next.js App Router pages
│   ├── components/            ← reusable UI components
│   ├── lib/                   ← shared utilities
│   │   ├── claude.ts          ← Claude API client
│   │   ├── supabase.ts        ← Supabase client
│   │   └── prompts.ts         ← prompt template engine
│   └── types/                 ← TypeScript type definitions
├── tests/
│   ├── unit/
│   └── e2e/
└── .github/
    └── workflows/
        └── ci.yml

## Coding standards to enforce
- TypeScript strict mode — no `any` types
- Every function needs a JSDoc comment explaining what it does
- Every new file needs a comment at the top: what it is and why it exists
- Commit message format: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
- No API keys or secrets in code — always use environment variables
- Handle all errors explicitly — no silent failures

## Banking domain rules
- Never log or expose programme names, client names, or financial data
- All AI outputs must be clearly labelled as AI-generated
- Prompt templates must include a disclaimer footer
- No PII in prompt inputs

## Current task / what I'm building right now
First working feature: a prompt template manager
- User can view a list of prompt templates
- User can select a template, fill in variables, and generate output via Claude API
- Output is saved to Supabase for audit trail

## Commands I use
npm run dev          # start local development server
npm run test         # run unit tests
npm run test:e2e     # run Playwright tests
npm run build        # production build check
git status           # check what's changed