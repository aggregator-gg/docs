// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.aggregator.gg',
	integrations: [
		starlight({
			title: 'The Aggregator',
			description: 'Public API documentation for The Aggregator — B2B game aggregation platform.',
			logo: {
				src: './src/assets/logo.svg',
				replacesTitle: false,
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/aggregator-gg' },
			],
			editLink: {
				baseUrl: 'https://github.com/aggregator-gg/docs/edit/main/',
			},
			customCss: ['./src/styles/custom.css'],
			plugins: [
				starlightOpenAPI([
					{
						base: 'api/v1',
						// Spec is synced from aggregator-gg/aggregator:docs/api/openapi.yaml
						// via .github/workflows/sync.yml (Core merge → docs PR).
						// See ADR-027 Decision 2 in the aggregator repo.
						schema: './openapi/aggregator.yaml',
						sidebar: {
							label: 'API Reference',
							collapsed: false,
							operations: {
								badges: true,
								labels: 'summary',
								sort: 'document',
							},
							tags: { sort: 'document' },
						},
					},
				]),
			],
			sidebar: [
				{
					label: 'Get Started',
					items: [
						{ label: 'Introduction', slug: 'get-started/introduction' },
						{ label: 'Quickstart', slug: 'get-started/quickstart' },
						{ label: 'Authentication', slug: 'get-started/authentication' },
						{ label: 'Environments', slug: 'get-started/environments' },
						{ label: 'How a game round works', slug: 'get-started/how-a-round-works' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Integration walkthrough', slug: 'guides/integration' },
						{ label: 'Wallet callbacks', slug: 'guides/wallet-callbacks' },
						{ label: 'Signature verification', slug: 'guides/signature-verification' },
						{ label: 'Idempotency', slug: 'guides/idempotency' },
						{ label: 'Testing in sandbox', slug: 'guides/testing-sandbox' },
						{ label: 'Going live', slug: 'guides/go-live' },
					],
				},
				...openAPISidebarGroups,
				{
					label: 'Resources',
					items: [
						{ label: 'Error codes', slug: 'resources/error-codes' },
						{ label: 'Versioning policy', slug: 'resources/versioning' },
						{ label: 'Changelog', slug: 'resources/changelog' },
						{ label: 'Status', link: 'https://status.aggregator.gg' },
					],
				},
			],
			head: [
				// robots.txt is served from public/robots.txt — see Decision 8
				// of ADR-027. Preview hostnames return Disallow: / via _headers
				// rewrites configured in Cloudflare Pages.
			],
		}),
	],
});
