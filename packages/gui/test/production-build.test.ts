import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const docsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../../docs');

test('production CSS retains Safari 16 media-query compatibility', () => {
  const index = readFileSync(resolve(docsDir, 'index.html'), 'utf8');
  const stylesheetPath = index.match(/href="\/crime_scripts\/(assets\/index-[^"]+\.css)"/)?.[1];

  assert.ok(stylesheetPath, 'production stylesheet is referenced from docs/index.html');

  const stylesheet = readFileSync(resolve(docsDir, stylesheetPath), 'utf8');

  assert.doesNotMatch(
    stylesheet,
    /\(width(?:<=|>=)/,
    'production CSS must not require media-query range syntax introduced in Safari 16.4',
  );
});

test('production guide ships ordered captions without restricted CLI media', () => {
  const assetsDir = resolve(docsDir, 'assets');
  const assetNames = readdirSync(assetsDir);
  const captionName = assetNames.find((name) => /^pax-handleiding\.nl-.+\.vtt$/.test(name));

  assert.ok(captionName, 'the production guide includes Dutch captions');
  assert.equal(
    assetNames.some((name) => name.startsWith('restricted-witwassen-cli-')),
    false,
    'restricted CLI media must not be bundled into the public application',
  );

  const captions = readFileSync(resolve(assetsDir, captionName), 'utf8');
  const cues = [...captions.matchAll(/(\d\d):(\d\d)\.(\d{3}) --> (\d\d):(\d\d)\.(\d{3})/g)].map((match) => ({
    start: Number(match[1]) * 60 + Number(match[2]) + Number(match[3]) / 1000,
    end: Number(match[4]) * 60 + Number(match[5]) + Number(match[6]) / 1000,
  }));

  assert.equal(cues.length, 5);
  cues.forEach((cue, index) => {
    assert.ok(cue.end > cue.start, `caption ${index + 1} has a positive duration`);
    if (index > 0) assert.ok(cue.start >= cues[index - 1].end, `caption ${index + 1} does not overlap`);
  });
});
