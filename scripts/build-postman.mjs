#!/usr/bin/env node
/**
 * Convert openapi/aggregator.yaml → Postman collection v2.1.0
 *
 * Output:
 *   public/downloads/aggregator.postman_collection.json
 *
 * Served by Astro at /downloads/aggregator.postman_collection.json
 * and referenced from /resources/postman/.
 *
 * Implements ADR-032 Decision 10 — Postman collection over Try-it-now.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Converter from 'openapi-to-postmanv2';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPEC_PATH = resolve(__dirname, '..', 'openapi', 'aggregator.yaml');
const OUT_PATH = resolve(
	__dirname,
	'..',
	'public',
	'downloads',
	'aggregator.postman_collection.json',
);

const spec = await readFile(SPEC_PATH, 'utf-8');

function convert(input, options) {
	return new Promise((resolveFn, rejectFn) => {
		Converter.convert({ type: 'string', data: input }, options, (err, result) => {
			if (err) return rejectFn(err);
			if (!result.result) return rejectFn(new Error(result.reason || 'unknown converter failure'));
			resolveFn(result.output[0].data);
		});
	});
}

const collection = await convert(spec, {
	folderStrategy: 'Tags',
	includeAuthInfoInExample: true,
	requestParametersResolution: 'Example',
	exampleParametersResolution: 'Example',
	includeWebhooks: false,
	collapseFolders: false,
	keepImplicitHeaders: true,
});

// Add a `base_url` collection variable + pre-populate auth template, so
// importing the collection gives you a usable env without manual editing.
collection.variable = [
	...(collection.variable || []),
	{ key: 'base_url', value: 'https://api.aggregator.gg/v1', type: 'string' },
	{
		key: 'apiKey',
		value: 'sk_live_REPLACE_ME',
		type: 'string',
		description:
			'Your operator API key from app.aggregator.gg/api-keys. Replace before sending requests.',
	},
	{
		key: 'idempotencyKey',
		value: '{{$randomUUID}}',
		type: 'string',
		description:
			'Auto-generated unique key for retryable POSTs. Postman regenerates per-request because $randomUUID is a dynamic variable.',
	},
];

// Replace generated baseUrl placeholder with our variable, so requests
// resolve to `{{base_url}}/games` etc.
const stringifyAndReplace = (obj) =>
	JSON.parse(
		JSON.stringify(obj).replace(
			/https?:\/\/api\.aggregator\.gg\/v1/g,
			'{{base_url}}',
		),
	);

const finalCollection = stringifyAndReplace(collection);

await mkdir(dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, JSON.stringify(finalCollection, null, 2));

console.log(`✓ Postman collection written: ${OUT_PATH}`);
console.log(
	`  Item count: ${countItems(finalCollection.item)}, variables: ${finalCollection.variable.length}`,
);

function countItems(items) {
	if (!items) return 0;
	return items.reduce(
		(sum, item) => sum + (item.item ? countItems(item.item) : 1),
		0,
	);
}
