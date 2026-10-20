import { randomUUID, randomInt } from 'node:crypto';
import { locationsFor } from '../public/zones.js';
export function randomBirthday(now = new Date(), choose = randomInt) {
  // Preview horses are adults; sample a calendar day 3–20 years before creation.
  const year = now.getUTCFullYear(), month = now.getUTCMonth(), day = now.getUTCDate();
  const first = Math.floor(Date.UTC(year - 20, month, day) / 86400000);
  const last = Math.floor(Date.UTC(year - 3, month, day) / 86400000);
  return new Date(choose(first,last + 1) * 86400000).toISOString().slice(0,10);
}

// Explicitly a preview sampler. It does not claim to implement production spawn odds.
export function createEncounters(catalog, locationId, count, searchNumber = 0, location) {
  location ??= locationsFor(catalog).find(l => l.id === locationId);
  if (!location) throw new Error('Unknown location.');
  const pool = location.speciesPool;
  const paletteNames = location.palettePool;
  return Array.from({ length: count }, (_, i) => {
    const species = pool[(i + searchNumber * count) % pool.length];
    const palette = catalog.palettes.find(p => p.name === paletteNames[(i + searchNumber) % paletteNames.length]);
    const personality = catalog.personalities[(i + searchNumber * 2) % catalog.personalities.length];
    const definition = catalog.species.find(s => s.name === species);
    const availableTraits = definition?.traits || catalog.traits?.[species] || {};
    const traits = { Mane: [availableTraits.Mane?.[0] || 'Awaiting species data'], Tail: [availableTraits.Tail?.[0] || 'Awaiting species data'] };
    let optionalCount = 0;
    for (const category of new Set(['Pattern', 'Paint', 'Cosmetic', 'Keratin', 'Ears', 'Whiskers', ...Object.keys(availableTraits)])) {
      if (['Mane', 'Tail'].includes(category)) continue;
      const first = availableTraits[category]?.find(v => v !== 'None');
      traits[category] = first && optionalCount++ < 10 ? [first] : [];
    }
    return {
      id: randomUUID(), name: '', species, age: 'Adult', origin: 'Wild',
      gender: (i + searchNumber) % 2 ? 'Male' : 'Female', size: 'Normal', sizePercent: 100,
      birthday: randomBirthday(),
      personality, locationId, palette: structuredClone(palette),
      eye: structuredClone(catalog.eyes[(i + searchNumber * count) % catalog.eyes.length]),
      traits,
      mutations: [], specialSpawn: null, favorite: false,
      preview: true, traitsComplete: !!(availableTraits.Mane?.length && availableTraits.Tail?.length), createdAt: new Date().toISOString()
    };
  });
}
