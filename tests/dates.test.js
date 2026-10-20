import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBirthday } from '../src/encounters.js';
import { displayBirthday } from '../public/dates.js';
test('preview birthdays sample real dates in the adult range and display month-day-year', () => {
  const now = new Date('2026-10-20T00:00:00Z');
  assert.equal(randomBirthday(now,(first,last) => first),'2006-10-20');
  assert.equal(randomBirthday(now,(first,last) => last-1),'2023-10-20');
  assert.equal(displayBirthday('2020-02-29'),'02-29-2020');
  assert.equal(displayBirthday('2006-10-20'),'10-20-2006');
});
