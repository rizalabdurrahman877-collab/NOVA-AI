# NOVA AI

NOVA AI is a Next.js + Supabase AI workspace focused on general AI, coding, reasoning, writing, and developer assistance.

## 1. Install

```bash
npm install
```

## 2. Environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AI_API_KEY`
- `AI_BASE_URL`
- `AI_MODEL`

Optional model variables: `AI_CODING_MODEL`, `AI_REASONING_MODEL`, `AI_WRITING_MODEL`, `AI_VISION_MODEL`.

## 3. Supabase

Open Supabase SQL Editor and run `supabase.sql`.

Then enable Email authentication in Supabase Authentication.

## 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## 5. Premium

The `profiles.plan` field supports `free` and `pro`. This starter uses the database field as the plan source. Connect your preferred payment provider later for automatic subscription changes.

## 6. AI Provider

The server calls an OpenAI-compatible `/chat/completions` endpoint. This makes it possible to use a compatible cloud provider or gateway by changing `AI_BASE_URL` and the model variables.

Never expose `AI_API_KEY` in `NEXT_PUBLIC_*` variables.
