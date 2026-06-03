# The Aggregator — Public API

This repo powers [docs.aggregator.gg](https://docs.aggregator.gg) — the public API documentation for **The Aggregator**, a B2B game aggregation platform.

If you are integrating with the API, **read [docs.aggregator.gg](https://docs.aggregator.gg) first** — this repo is the source code behind that site.

---

## Quick links for developers

| What | URL | Format |
|---|---|---|
| **OpenAPI 3.1 spec** | https://raw.githubusercontent.com/aggregator-gg/docs/main/openapi/aggregator.yaml | YAML, ~19KB |
| **Postman collection** | https://docs.aggregator.gg/downloads/aggregator.postman_collection.json | Postman v2.1, ~80KB |
| **API reference** (interactive) | https://docs.aggregator.gg/api/v1/operations/listgames/ | HTML |
| **Code samples** (TS / PHP / Python) | https://docs.aggregator.gg/guides/code-samples/ | HTML |

## Quick links for AI agents / LLMs

| What | URL | What it gives you |
|---|---|---|
| `llms.txt` | https://docs.aggregator.gg/llms.txt | Curated index of the most important pages, in the [llms.txt](https://llmstxt.org/) standard format. **Start here.** |
| `llms-full.txt` | https://docs.aggregator.gg/llms-full.txt | Single-file plain-text concatenation of every guide. ~100KB. Feed directly to LLM context if you want everything at once. |
| OpenAPI spec | https://raw.githubusercontent.com/aggregator-gg/docs/main/openapi/aggregator.yaml | Machine-readable contract — the canonical source of truth for endpoints, schemas, examples. |

### Cloudflare access for AI agents

The docs site is intentionally public for human readers, search engines, and integration agents. `public/robots.txt` allows all crawlers, and the AI-readable entrypoints above are plain static assets. If an agent reports `403` from Cloudflare, the block is coming from the Cloudflare zone configuration, not from Astro/Starlight or this repo.

Quick diagnosis:

```bash
curl -I https://docs.aggregator.gg/
curl -I -A 'ClaudeBot/1.0 (+https://www.anthropic.com/)' https://docs.aggregator.gg/llms.txt
curl -I -A 'Claude-User/1.0' https://docs.aggregator.gg/llms-full.txt
```

Expected result: all three return `200`. If the `ClaudeBot` or `Claude-User` checks return `403`, update Cloudflare:

1. Go to `Security` -> `WAF` -> `Custom rules` for the `aggregator.gg` zone.
2. Create a rule named `Allow AI agents on public docs`.
3. Expression:

   ```text
   http.host eq "docs.aggregator.gg"
   and (
     cf.client.bot
     or lower(http.user_agent) contains "claudebot"
     or lower(http.user_agent) contains "claude-user"
     or lower(http.user_agent) contains "anthropic"
     or lower(http.user_agent) contains "codex"
     or lower(http.user_agent) contains "openai"
     or lower(http.user_agent) contains "gptbot"
     or lower(http.user_agent) contains "chatgpt-user"
     or lower(http.user_agent) contains "cursor"
     or lower(http.user_agent) contains "anysphere"
     or lower(http.user_agent) contains "perplexitybot"
     or lower(http.user_agent) contains "ccbot"
   )
   ```

4. Action: `Skip`.
5. Skip options: `All Super Bot Fight Mode rules`, `All managed rules`, `User Agent Blocking`, and rate limiting rules if a docs-specific rate limit exists.
6. Save, then rerun the `curl` checks above.

If the zone uses Cloudflare **Bot Fight Mode** rather than **Super Bot Fight Mode**, WAF skip rules cannot bypass it. Disable Bot Fight Mode for the zone, move to Super Bot Fight Mode with the skip rule above, or add an IP Access rule for a known trusted client. Do not require browser challenges on `docs.aggregator.gg`, `/llms.txt`, `/llms-full.txt`, `/openapi/*`, or `/downloads/*`; those are integration surfaces for machine clients.

## Generating a client SDK

For Java, Go, C#, Ruby, Kotlin, Rust — generate a typed client from the spec:

```sh
npx @openapitools/openapi-generator-cli generate \
  -i https://raw.githubusercontent.com/aggregator-gg/docs/main/openapi/aggregator.yaml \
  -g python \
  -o ./aggregator-client
```

Swap `-g python` for any of [openapi-generator's 30+ targets](https://openapi-generator.tech/docs/generators/).

---

## Local development (of the docs site)

```bash
npm install
npm run dev    # localhost:4321
npm run build  # static output to dist/
```

`npm run build` does three things in order:
1. Generates the Postman collection from `openapi/aggregator.yaml` → `public/downloads/aggregator.postman_collection.json`
2. Generates `llms-full.txt` from the curated MDX pages
3. Runs `astro build` to produce the static site

## Structure

```
src/content/docs/
├── get-started/        — tutorials (introduction, quickstart, auth, environments, round lifecycle)
├── guides/             — how-tos (integration, code samples, callbacks, signature, idempotency, testing, go-live)
└── resources/          — reference (error codes, versioning, changelog, postman, status)

openapi/aggregator.yaml — single source of truth for the API contract
scripts/build-*.mjs     — build-time generators (Postman + llms-full)
public/                 — static assets served as-is by Cloudflare Pages
```

The interactive API reference under `/api/v1/...` is auto-generated from `openapi/aggregator.yaml` by the [`starlight-openapi`](https://starlight-openapi.vercel.app/) plugin at build time.

## Deploy

Cloudflare Pages auto-builds on push to `main`. Preview deploys per branch at `<branch>.aggregator-docs.pages.dev`.

## Contributing

This is the public source for `docs.aggregator.gg`. The repo is public for SEO + indexability + linkability; content changes ship through internal PRs, not community drive-by edits. If you spot an error in the docs, open an issue.
