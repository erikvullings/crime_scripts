import assert from 'node:assert/strict';
import test from 'node:test';
import { hasUserLoadedCollection } from '../src/services/workspace-source.ts';

test('only imported and pre-existing workspaces prioritize the overview', () => {
  assert.equal(hasUserLoadedCollection('imported'), true);
  assert.equal(hasUserLoadedCollection('existing'), true);
  assert.equal(hasUserLoadedCollection('starter'), false);
  assert.equal(hasUserLoadedCollection('empty'), false);
  assert.equal(hasUserLoadedCollection(null), false);
});
