const cosmicNames = new Set(['solar','lunar','heavenly','void','astral']);
const normalized = value => String(value || '').trim().toLowerCase();

export function cosmicPalette(horse,catalog) {
  // The explicit spawn type wins; legacy/imported horses can identify it by mutation.
  const names = [horse.specialSpawn,...(horse.mutations || []).map(m => typeof m === 'string' ? m : m?.name)];
  const name = names.map(normalized).find(name => cosmicNames.has(name));
  return name ? catalog.palettes.find(p => p.complete && normalized(p.name) === name) : null;
}

export function synchronizeCosmicPalettes(horses,catalog) {
  let changed = 0;
  for (const horse of horses) {
    const palette = cosmicPalette(horse,catalog);
    if (!palette) continue; // Preserve saved visuals if a matching definition was deleted.
    const skins = palette.assetSkins || [];
    const skinId = skins.includes(horse.skinId) ? horse.skinId : skins[0] || null;
    if (horse.paletteId === palette.id && horse.skinId === skinId && JSON.stringify(horse.palette) === JSON.stringify(palette)) continue;
    horse.palette = structuredClone(palette);
    horse.paletteId = palette.id;
    horse.skinId = skinId;
    changed++;
  }
  return changed;
}
