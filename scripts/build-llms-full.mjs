#!/usr/bin/env node
/**
 * Build public/llms-full.txt — a single plain-text concatenation of every
 * curated MDX page in the docs site, intended for LLM context ingestion.
 *
 * Order matches the sidebar: get-started → guides → resources. API
 * reference pages are excluded — agents that need the machine contract
 * should fetch openapi/aggregator.yaml directly (we link to it in the
 * llms.txt index).
 *
 * Pre-process strips: frontmatter, MDX-only imports, JSX components.
 * Output is plain Markdown, safe for any LLM to ingest.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DOCS_DIR = join(ROOT, 'src', 'content', 'docs');
const OUT_PATH = join(ROOT, 'public', 'llms-full.txt');

const SECTION_ORDER = [
	{ dir: 'get-started', label: 'Get Started' },
	{ dir: 'guides', label: 'Guides' },
	{ dir: 'resources', label: 'Resources' },
];

// Roughly stable sort within sections to match sidebar order in
// astro.config.mjs. Anything not listed sorts alphabetically at the end.
const PAGE_ORDER = {
	'get-started': [
		'introduction',
		'quickstart',
		'authentication',
		'environments',
		'how-a-round-works',
	],
	guides: [
		'integration',
		'code-samples',
		'wallet-callbacks',
		'signature-verification',
		'idempotency',
		'testing-sandbox',
		'go-live',
	],
	resources: ['error-codes', 'versioning', 'changelog', 'postman'],
};

function stripFrontmatter(text) {
	if (!text.startsWith('---\n')) return text;
	const end = text.indexOf('\n---\n', 4);
	if (end < 0) return text;
	return text.slice(end + 5).trimStart();
}

function stripMdx(text) {
	return text
		// drop import lines
		.replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '')
		// drop self-closing JSX components like <LinkCard ... />
		.replace(/<[A-Z][A-Za-z0-9]*\b[^>]*\/>/g, '')
		// flatten <Tabs syncKey="lang"> ... </Tabs> wrappers
		.replace(/<Tabs[^>]*>/g, '')
		.replace(/<\/Tabs>/g, '')
		// flatten <TabItem label="X"> ... </TabItem> with a heading hint
		.replace(/<TabItem\s+label="([^"]+)"[^>]*>/g, '\n**$1:**\n')
		.replace(/<\/TabItem>/g, '\n')
		// flatten <Aside type="..."> ... </Aside>
		.replace(/<Aside[^>]*>/g, '\n> ')
		.replace(/<\/Aside>/g, '\n')
		// flatten <Steps> wrapper (numbered lists already render fine)
		.replace(/<\/?Steps>/g, '')
		// collapse runs of blank lines
		.replace(/\n{3,}/g, '\n\n');
}

async function pagePaths(sectionDir) {
	const fullDir = join(DOCS_DIR, sectionDir);
	const entries = await readdir(fullDir, { withFileTypes: true });
	// Map slug → actual filename (preserves the original extension)
	const slugToFile = new Map();
	for (const e of entries) {
		if (!e.isFile()) continue;
		const m = e.name.match(/^(.+)\.(mdx|md)$/);
		if (m) slugToFile.set(m[1], e.name);
	}

	const ordered = PAGE_ORDER[sectionDir] ?? [];
	const known = ordered.filter((s) => slugToFile.has(s));
	const extras = [...slugToFile.keys()].filter((s) => !ordered.includes(s)).sort();
	return [...known, ...extras].map((slug) => ({
		slug,
		path: join(fullDir, slugToFile.get(slug)),
	}));
}

const out = [];
out.push('# The Aggregator API — full documentation');
out.push('');
out.push('Single-file concatenation of every curated guide on https://docs.aggregator.gg.');
out.push('Source of truth for the machine contract is the OpenAPI spec — fetch it separately:');
out.push('  https://raw.githubusercontent.com/aggregator-gg/docs/main/openapi/aggregator.yaml');
out.push('');

for (const section of SECTION_ORDER) {
	out.push('');
	out.push(`# ${section.label}`);
	out.push('');
	const pages = await pagePaths(section.dir);
	for (const { slug, path } of pages) {
		const raw = await readFile(path, 'utf-8');
		const text = stripMdx(stripFrontmatter(raw));
		out.push(`<!-- ${section.dir}/${slug} -->`);
		out.push('');
		out.push(text.trim());
		out.push('');
		out.push('---');
		out.push('');
	}
}

await writeFile(OUT_PATH, out.join('\n'));
const sizeKB = (Buffer.byteLength(out.join('\n'), 'utf8') / 1024).toFixed(1);
console.log(`✓ llms-full.txt written: ${OUT_PATH} (${sizeKB} KB)`);
