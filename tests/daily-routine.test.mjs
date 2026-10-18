import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getNewlyCompletedRoutineBlockIds,
  getTodayRoutineBlockIds,
  withRoutineBlockCompletions,
} from '../shared/dailyCommitment.ts';

const DAY = 86400000;
const day1 = new Date(2026, 9, 17).getTime();
const day2 = day1 + DAY;
const day3 = day2 + DAY;

const complete = (completions, blockIds, at) =>
  withRoutineBlockCompletions(completions, blockIds, at);

test('a fresh routine starts with the first blocks for the chosen daily amount', () => {
  assert.deepEqual(getTodayRoutineBlockIds(2, [], day1), ['noRep']);
  assert.deepEqual(getTodayRoutineBlockIds(5, [], day1), ['noRep', 'bookSession1']);
  assert.deepEqual(getTodayRoutineBlockIds(10, [], day1), [
    'noRep',
    'bookSession1',
    'bookSession2',
    'bookSession3',
  ]);
  assert.equal(getTodayRoutineBlockIds(15, [], day1).length, 7);
});

test('finished blocks stay in today plan and the next blocks follow tomorrow', () => {
  const done = complete([], ['noRep', 'bookSession1'], day1 + 1000);

  assert.deepEqual(getTodayRoutineBlockIds(5, done, day1), ['noRep', 'bookSession1']);
  assert.deepEqual(getTodayRoutineBlockIds(5, done, day2), ['bookSession2', 'bookSession3']);
});

test('an unfinished block carries over to the front of the next day', () => {
  const done = complete([], ['bookSession1'], day1 + 1000);

  assert.deepEqual(getTodayRoutineBlockIds(5, done, day1), ['noRep', 'bookSession1']);
  assert.deepEqual(getTodayRoutineBlockIds(5, done, day2), ['noRep', 'bookSession2']);
});

test('the rotation wraps around and keeps moving one block at a time', () => {
  let completions = [];
  const seen = [];

  for (let day = 0; day < 9; day++) {
    const dayStart = day1 + day * DAY;
    const [blockId] = getTodayRoutineBlockIds(2, completions, dayStart);
    seen.push(blockId);
    completions = complete(completions, [blockId], dayStart + 1000);
  }

  assert.deepEqual(seen, [
    'noRep',
    'bookSession1',
    'bookSession2',
    'bookSession3',
    'drawings',
    'mathSession1',
    'mathSession2',
    'noRep',
    'bookSession1',
  ]);
});

test('the full plan shows every block every day, whatever was left unfinished', () => {
  const done = complete([], ['bookSession1', 'drawings'], day1 + 1000);

  assert.equal(getTodayRoutineBlockIds(15, done, day1).length, 7);
  assert.equal(getTodayRoutineBlockIds(15, done, day2).length, 7);
});

test('changing the daily amount mid-day keeps finished blocks and adjusts what is left', () => {
  const done = complete([], ['noRep', 'bookSession1'], day1 + 1000);

  assert.deepEqual(getTodayRoutineBlockIds(2, done, day1), ['noRep', 'bookSession1']);
  assert.deepEqual(getTodayRoutineBlockIds(10, done, day1), [
    'bookSession2',
    'bookSession3',
    'noRep',
    'bookSession1',
  ]);
  assert.deepEqual(getTodayRoutineBlockIds(2, done, day3), ['bookSession2']);
});

test('recording a block keeps only its latest completion', () => {
  const first = complete([], ['noRep'], day1);
  const second = complete(first, ['noRep', 'drawings'], day2);

  assert.deepEqual(second, [
    { blockId: 'noRep', completedAt: day2 },
    { blockId: 'drawings', completedAt: day2 },
  ]);
});

const doneBlocks = (...blockIds) => ({
  noRep: false,
  bookSession1: false,
  bookSession2: false,
  bookSession3: false,
  drawings: false,
  mathSession1: false,
  mathSession2: false,
  ...Object.fromEntries(blockIds.map((blockId) => [blockId, true])),
});

test('only done blocks from today plan that are not yet recorded today are newly completed', () => {
  assert.deepEqual(
    getNewlyCompletedRoutineBlockIds(5, [], day1, doneBlocks('bookSession1', 'drawings')),
    ['bookSession1']
  );

  const done = complete([], ['bookSession1'], day1 + 1000);

  assert.deepEqual(getNewlyCompletedRoutineBlockIds(5, done, day1, doneBlocks('bookSession1')), []);
  assert.deepEqual(
    getNewlyCompletedRoutineBlockIds(5, done, day1, doneBlocks('noRep', 'bookSession1')),
    ['noRep']
  );
});
