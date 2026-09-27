import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  compareCaseHypotheses,
  type CaseEvidenceItem,
  type CaseMatchResult,
} from '../src/models/case-matching.ts';
import type { CrimeScript, DataModel } from '../src/models/data-model.ts';

const evidence = (id: string, label = id): CaseEvidenceItem => ({
  id: `text:${id}`,
  label,
  source: 'text',
});

const result = (
  scriptId: string,
  matched: CaseEvidenceItem[],
  unmatched: CaseEvidenceItem[]
): CaseMatchResult => ({
  scriptId,
  scriptFamilyId: scriptId,
  score: 75,
  coverage: matched.length / (matched.length + unmatched.length),
  specificity: 0.75,
  matchedEvidence: matched.map((item) => ({
    evidence: item,
    strength: 3,
    locations: [{ field: 'script', label: scriptId }],
  })),
  unmatchedEvidence: unmatched,
  scenes: [],
});

const emptyModel: DataModel = {
  schemaVersion: 3,
  version: 1,
  lastUpdate: 1,
  crimeScripts: [],
  cast: [],
  attributes: [],
  locations: [],
  geoLocations: [],
  products: [],
  transports: [],
  partners: [],
};

const script = (
  id: string,
  indicators: string[],
  conditions: string[]
): CrimeScript => ({
  id,
  scriptFamilyId: id,
  classification: 'public',
  label: id,
  owner: 'owner',
  updated: 1,
  reviewer: [],
  status: 4 as CrimeScript['status'],
  literature: [],
  productIds: [],
  geoLocationIds: [],
  language: 'en',
  aiGenerated: false,
  stages: [{
    id: `${id}-scene`,
    label: `${id} scene`,
    variants: [{
      id: `${id}-variant`,
      label: `${id} variant`,
      activities: [],
      conditions: conditions.map((label) => ({
        id: `${id}-condition-${label}`,
        label,
        type: 'Facilitator',
      })),
      indicators: indicators.map((label) => ({ id: `${id}-indicator-${label}`, label })),
      opportunities: [],
      measures: [],
    }],
  }],
});

test('comparison separates shared, distinguishing, and unexplained observations', () => {
  const shared = evidence('container');
  const firstOnly = evidence('cutters');
  const secondOnly = evidence('warehouse');
  const unexplained = evidence('burner-phone', 'burner phone');

  const comparison = compareCaseHypotheses({
    model: emptyModel,
    results: [
      result('first', [shared, firstOnly], [secondOnly, unexplained]),
      result('second', [shared, secondOnly], [firstOnly, unexplained]),
    ],
  });

  assert.deepEqual({
    shared: comparison.sharedEvidence.map(({ label }) => label),
    distinguishing: comparison.candidates.map(({ scriptId, distinguishingEvidence }) => ({
      scriptId,
      labels: distinguishingEvidence.map(({ evidence: { label } }) => label),
    })),
    unexplained: comparison.unexplainedEvidence.map(({ label }) => label),
  }, {
    shared: ['container'],
    distinguishing: [
      { scriptId: 'first', labels: ['cutters'] },
      { scriptId: 'second', labels: ['warehouse'] },
    ],
    unexplained: ['burner phone'],
  });
});

test('follow-up prompts contain bounded, deduplicated differences between hypotheses', () => {
  const data = {
    ...emptyModel,
    crimeScripts: [
      script('first', ['Zulu marker', 'Broken seal'], ['Low supervision', 'broken seal']),
      script('second', ['Alpha marker', 'Bravo marker'], ['Low supervision']),
    ],
  };

  const comparison = compareCaseHypotheses({
    model: data,
    results: [result('first', [], []), result('second', [], [])],
    promptLimit: 2,
  });

  assert.deepEqual(
    comparison.followUpPrompts.map(({ field, label, scriptIds }) => ({
      field,
      label,
      scriptIds,
    })),
    [
      { field: 'indicator', label: 'Alpha marker', scriptIds: ['second'] },
      { field: 'indicator', label: 'Broken seal', scriptIds: ['first'] },
    ]
  );
});
