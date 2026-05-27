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

Architecture decisions: see [ADR-032 in aggregator-gg/aggregator](https://github.com/aggregator-gg/aggregator/blob/main/docs/architecture/ADR-032-PUBLIC-API-DOCS.md) (private repo — read-only for the platform team).

## Contributing

This is the public source for `docs.aggregator.gg`. The repo is public for SEO + indexability + linkability; content changes ship through internal PRs, not community drive-by edits. If you spot an error in the docs, open an issue.
