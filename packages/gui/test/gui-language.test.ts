import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveGuiLanguage } from '../src/services/gui-language.ts';

test('guide links can explicitly select their language before routes initialize', () => {
  assert.equal(resolveGuiLanguage('#!/guide?lang=en', 'nl'), 'en');
  assert.equal(resolveGuiLanguage('#!/handleiding?lang=nl', 'en'), 'nl');
});

test('stored and default languages remain available without an explicit link language', () => {
  assert.equal(resolveGuiLanguage('#!/guide', 'en'), 'en');
  assert.equal(resolveGuiLanguage('#!/', 'unsupported'), 'nl');
  assert.equal(resolveGuiLanguage('#!/', null), 'nl');
});
