# aggregator-gg/docs

Public API documentation for The Aggregator — `https://docs.aggregator.gg`.

Built with [Astro Starlight](https://starlight.astro.build/) and
[`starlight-openapi`](https://starlight-openapi.vercel.app/). Hosted on
Cloudflare Pages. Architecture source of truth:
[ADR-032](https://github.com/aggregator-gg/aggregator/blob/main/docs/architecture/ADR-032-PUBLIC-API-DOCS.md).

## Local development

```bash
npm install
npm run dev    # localhost:4321
npm run build  # static output to dist/
```

The OpenAPI spec is read from `../aggregator/docs/api/openapi.yaml` —
clone `aggregator-gg/aggregator` as a sibling directory of this repo.

## Structure

```
src/content/docs/
├── get-started/        — tutorials (introduction, quickstart, auth, envs, round lifecycle)
├── guides/             — how-tos (integration, callbacks, signature, idempotency, sandbox, go-live)
└── resources/          — reference (error codes, versioning policy, changelog)
```

API Reference pages are auto-generated from `aggregator/docs/api/openapi.yaml`
by the `starlight-openapi` plugin at build time.

## Sync from Core

Markdown content under `src/content/docs/` is synced from the Core repo's
`docs/api/` directory via a GitHub Action (see `.github/workflows/sync.yml`).
The sync action opens a PR on every merge to Core `main` that touches
`docs/api/**`. Auto-merge if only mirrored paths changed.

## Deploy

Cloudflare Pages auto-builds on push to `main`. Preview deploys per branch
at `<branch>.aggregator-docs.pages.dev`.

## Adding a new endpoint

1. In `aggregator-gg/aggregator`, add the route to `src/api/routes/*.py`
2. Update `docs/api/openapi.yaml` in the same PR — the `contract-openapi`
   CI check requires it
3. On Core merge, this docs repo gets an auto-PR with the synced YAML
4. Once that PR merges, the new endpoint appears at
   `docs.aggregator.gg/api/v1/operations/<operation-id>/`
