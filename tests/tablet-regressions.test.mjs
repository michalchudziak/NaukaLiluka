import assert from 'node:assert/strict';
import test from 'node:test';
import { formatAccountDate } from '../shared/accountDate.ts';
import { resolveTripleIndex } from '../shared/bookProgress.ts';
import { parseNumberDraft } from '../shared/numberInput.ts';
import { parseCompletion, serializeCompletion } from '../shared/presentation.ts';

const today = new Date(2026, 9, 17).getTime();

test('partial short-plan sessions retain the new book set, including rows written by older clients', () => {
  assert.equal(resolveTripleIndex([0], today - 86400000, today, 3), 1);
  assert.equal(resolveTripleIndex([0], today + 1000, today, 3, ['session2:words']), 1);
  assert.equal(resolveTripleIndex([0], today - 86400000, today, 3, ['session2:words']), 1);
});

test('a completed set remains available today and advances the next day', () => {
  assert.equal(resolveTripleIndex([0, 1], today + 1000, today, 3), 1);
  assert.equal(resolveTripleIndex([0, 1], today + 1000, today + 86400000, 3), 2);
  assert.equal(resolveTripleIndex([], 0, today, 3, ['session1:words']), 0);
});

test('numeric drafts accept a whole valid value without substituting partial or empty input', () => {
  for (const input of ['', '3', '30', '300', '5001', '3000ms', '2.5']) {
    assert.equal(parseNumberDraft(input, 500, 5000), null, input);
  }
  assert.equal(parseNumberDraft('3000', 500, 5000), 3000);
  assert.equal(parseNumberDraft('0', 0, 144), 0);
  assert.equal(parseNumberDraft('144', 0, 144), 144);
});

test('account dates accept Convex millisecond timestamps and auth ISO strings', () => {
  assert.match(formatAccountDate(Date.UTC(2026, 9, 17, 12)), /17 października 2026/);
  assert.match(formatAccountDate('2026-10-17T12:00:00Z'), /17 października 2026/);
  assert.match(formatAccountDate(new Date('2026-10-17T12:00:00Z')), /17 października 2026/);
  assert.equal(formatAccountDate('bad date'), null);
  assert.equal(formatAccountDate(null), null);
});

test('completion metadata preserves the exact launched book set and rejects invalid sessions', () => {
  const completion = {
    kind: 'book',
    session: 'session3',
    contentType: 'sentences',
    bookIndex: 0,
    tripleIndex: 1,
  };
  assert.deepEqual(parseCompletion(serializeCompletion(completion)), completion);
  assert.equal(parseCompletion('{bad json'), null);
  assert.equal(parseCompletion(JSON.stringify({ ...completion, tripleIndex: -1 })), null);
  assert.equal(parseCompletion(JSON.stringify({ kind: 'math', session: 'session1' })), null);
});
