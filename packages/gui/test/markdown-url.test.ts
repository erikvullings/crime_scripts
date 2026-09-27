import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeMarkdownAssetUrl } from '../src/services/markdown-url.ts';

test('Markdown asset escaping preserves the deployed base path', () => {
  assert.equal(
    escapeMarkdownAssetUrl('/crime_scripts/assets/image_hash.png'),
    '/crime_scripts/assets/image%5Fhash.png'
  );
});
