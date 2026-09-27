import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Condition, CrimeScript, DataModel } from '../src/models/data-model.ts';
import { matchCaseEvidence, type CaseTokenizer } from '../src/models/case-matching.ts';

const tokenize: CaseTokenizer = (text) =>
  (text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) || [])
    .map((word) => word.endsWith('s') ? word.slice(0, -1) : word);

const createScript = (
  id: string,
  overrides: Partial<CrimeScript> = {}
): CrimeScript => ({
  id,
  scriptFamilyId: id,
  classification: 'public',
  label: id,
  description: '',
  owner: 'owner',
  updated: 1,
  reviewer: [],
  status: 4 as CrimeScript['status'],
  literature: [],
  stages: [],
  productIds: [],
  geoLocationIds: [],
  language: 'en',
  aiGenerated: false,
  ...overrides,
});

const model = (crimeScripts: CrimeScript[]): DataModel => ({
  schemaVersion: 3,
  version: 1,
  lastUpdate: 1,
  crimeScripts,
  cast: [{ id: 'courier', label: 'Courier' }],
  attributes: [
    {
      id: 'cutters',
      label: 'Bolt cutters',
      synonyms: ['cutting tools'],
      parents: ['equipment'],
    },
    { id: 'equipment', label: 'Equipment' },
  ],
  locations: [
    { id: 'warehouse', label: 'Warehouse', parents: ['industrial'] },
    { id: 'industrial', label: 'Industrial location' },
    { id: 'residential', label: 'Residential property' },
  ],
  geoLocations: [{ id: 'rotterdam', label: 'Rotterdam' }],
  products: [{ id: 'cocaine', label: 'Cocaine' }],
  transports: [{ id: 'truck', label: 'Truck' }],
  partners: [{ id: 'customs', label: 'Customs' }],
});

test('case matching covers narrative, taxonomy, indicator, opportunity, barrier, and partner evidence', () => {
  const data = model([
    createScript('port-route', {
      label: 'Harbour shipment',
      productIds: ['cocaine'],
      geoLocationIds: ['rotterdam'],
      stages: [
        {
          id: 'arrival',
          label: 'Arrival',
          variants: [
            {
              id: 'concealment',
              label: 'Concealment',
              locationIds: ['warehouse'],
              activities: [
                {
                  id: 'unload',
                  label: 'Unload cargo',
                  cast: ['courier'],
                  attributes: ['cutters'],
                  transports: ['truck'],
                },
              ],
              conditions: [
                {
                  id: 'night',
                  label: 'Night shift',
                  type: 'Facilitator' as Condition['type'],
                },
              ],
              indicators: [{ id: 'seal', label: 'Broken seal' }],
              opportunities: [{ id: 'rush', label: 'Peak-hour rush' }],
              measures: [{ id: 'access', label: 'Access checks', cat: 'situational', partners: ['customs'] }],
            },
          ],
        },
      ],
    }),
  ]);

  const [result] = matchCaseEvidence({
    model: data,
    scriptMode: 'public',
    text: 'shipment arrival concealment unload night seal rush access customs cutting',
    filters: {
      productIds: ['cocaine'],
      geoLocationIds: ['rotterdam'],
      locationIds: ['warehouse'],
      roleIds: ['courier'],
      attributeIds: ['cutters'],
      transportIds: ['truck'],
    },
    tokenize,
  });

  assert.equal(result.scriptId, 'port-route');
  assert.equal(result.coverage, 1);
  assert.deepEqual(
    new Set(result.matchedEvidence.flatMap(({ locations }) => locations.map(({ field }) => field))),
    new Set([
      'script',
      'scene',
      'variant',
      'activity',
      'condition',
      'indicator',
      'opportunity',
      'barrier',
      'product',
      'geographic-location',
      'location',
      'role',
      'attribute',
      'transport',
      'partner',
    ])
  );
  assert.equal(result.scenes[0].sceneId, 'arrival');
  assert.ok(result.scenes[0].matchedEvidenceIds.length > 0);
});

test('structured selections are hard constraints and parent selections include descendants', () => {
  const data = model([
    createScript('warehouse-route', {
      stages: [
        {
          id: 'scene',
          label: 'Scene',
          variants: [
            {
              id: 'variant',
              label: 'Variant',
              locationIds: ['warehouse'],
              activities: [],
              conditions: [],
              indicators: [],
              opportunities: [],
              measures: [],
            },
          ],
        },
      ],
    }),
  ]);

  assert.equal(
    matchCaseEvidence({
      model: data,
      scriptMode: 'public',
      filters: { locationIds: ['industrial'] },
      tokenize,
    }).length,
    1
  );
  assert.deepEqual(
    matchCaseEvidence({
      model: data,
      scriptMode: 'public',
      text: 'warehouse',
      filters: { locationIds: ['residential'] },
      tokenize,
    }),
    []
  );
});

test('duplicate text cannot outweigh a more specific match', () => {
  const repeated = Array(20).fill('warehouse').join(' ');
  const data = model([
    createScript('verbose', {
      stages: [
        {
          id: 'verbose-scene',
          label: 'Scene',
          variants: [
            {
              id: 'verbose-variant',
              label: 'Variant',
              activities: [{ id: 'verbose-activity', label: 'Move goods', description: repeated }],
              conditions: [],
              indicators: [],
              opportunities: [],
              measures: [],
            },
          ],
        },
      ],
    }),
    createScript('specific', { label: 'Warehouse route' }),
  ]);

  const results = matchCaseEvidence({
    model: data,
    scriptMode: 'public',
    text: 'warehouse',
    tokenize,
  });

  assert.deepEqual(results.map(({ scriptId }) => scriptId), ['specific', 'verbose']);
  assert.equal(results[1].matchedEvidence.length, 1);
});

test('matching uses each script language and returns one visible counterpart per family', () => {
  const languages: string[] = [];
  const languageTokenizer: CaseTokenizer = (text, language) => {
    languages.push(language);
    return tokenize(text);
  };
  const data = model([
    createScript('public', {
      scriptFamilyId: 'family',
      classification: 'public',
      label: 'Harbour route',
      language: 'en',
    }),
    createScript('restricted', {
      scriptFamilyId: 'family',
      classification: 'restricted',
      label: 'Harbour route restricted',
      language: 'nl',
    }),
  ]);

  const results = matchCaseEvidence({
    model: data,
    scriptMode: 'restricted',
    text: 'harbour',
    tokenize: languageTokenizer,
  });

  assert.deepEqual(results.map(({ scriptId }) => scriptId), ['restricted']);
  assert.ok(languages.includes('nl'));
  assert.ok(!languages.includes('en'));
});
