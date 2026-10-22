const specialTypes = new Set(['solar','lunar','heavenly','void','astral']);
const normalized = value => String(value || '').trim().toLowerCase();

export function horseCardRank(horse,catalog) {
  const special = specialTypes.has(normalized(horse.specialSpawn)) || (horse.mutations || []).some(m => specialTypes.has(normalized(typeof m === 'string' ? m : m?.name)));
  if (special) return {key:'mutated',label:'Mutated'};
  // New horses retain a species snapshot. Older records resolve through the registry.
  const species = catalog?.species?.find(s => s.id === horse.speciesId) || catalog?.species?.find(s => s.name === horse.species);
  const event = Object.hasOwn(horse,'speciesEvent') ? horse.speciesEvent : species?.event;
  if (event) return {key:'none',label:'Event'};
  const tier = horse.rarityTier ?? species?.rarityTier;
  if (tier === 1 || tier === 2) return {key:'rare',label:tier === 1 ? 'Ultra Rare' : 'Rare'};
  if (tier === 3) return {key:'uncommon',label:'Uncommon'};
  return {key:'none',label:'Common'};
}
