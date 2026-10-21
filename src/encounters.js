import {spawnHorse} from './spawning.js';
import {normalizeCatalog} from '../public/definitions.js';
import { randomInt } from 'node:crypto';
import { locationsFor } from '../public/zones.js';
export function randomBirthday(now = new Date(), choose = randomInt) {
  // Preview horses are adults; sample a calendar day 3–20 years before creation.
  const year = now.getUTCFullYear(), month = now.getUTCMonth(), day = now.getUTCDate();
  const first = Math.floor(Date.UTC(year - 20, month, day) / 86400000);
  const last = Math.floor(Date.UTC(year - 3, month, day) / 86400000);
  return new Date(choose(first,last + 1) * 86400000).toISOString().slice(0,10);
}

// Each horse independently reads the current registries through the spawning pipeline.
export function createEncounters(catalog, locationId, count, searchNumber = 0, location, rng) {
  location ??= locationsFor(catalog).find(l => l.id === locationId);
  if (!location) throw new Error('Unknown location.');
  const registry = normalizeCatalog(catalog);
  return Array.from({length:count},() => spawnHorse(registry,location,rng));
}
