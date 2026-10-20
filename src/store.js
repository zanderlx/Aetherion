import { validateHorseName, horseRecords, updateHorseField } from '../public/horse-fields.js';
import { mkdir, readFile, writeFile, rename, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createEncounters } from './encounters.js';
import { locationsFor, validateZone } from '../public/zones.js';
import { catalogFor, validateDefinition, definitionKinds } from '../public/definitions.js';
import { validateKeeper } from '../public/keeper.js';
import { validateCopyPatch } from '../public/page-copy.js';

export class GameStore {
  constructor(directory, catalog, defaults) {
    this.directory = directory;
    this.catalog = catalog;
    this.defaults = defaults;
    this.queue = Promise.resolve();
  }
  async init() {
    await mkdir(join(this.directory, 'player'), { recursive: true });
    await mkdir(join(this.directory, 'backups'), { recursive: true });
    this.file = join(this.directory, 'player', 'save.json');
    try {
      this.state = JSON.parse(await readFile(this.file, 'utf8'));
      if (this.state.version !== 1 || !Array.isArray(this.state.horses) || !Array.isArray(this.state.sold) || !this.state.settings) throw new Error('Invalid save structure');
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error(`Cannot read save; existing file has been preserved. ${error.message}`);
      this.state = { version: 1, gold: this.defaults.startingGold, settings: structuredClone(this.defaults), horses: [], sold: [], inventory: [], transactions: [], encounters: {}, searches: {}, createdAt: new Date().toISOString(), savedAt: null };
      await this.persist(this.state, false);
    }
    this.state.customLocations ??= [];
    return this;
  }
  async persist(next, backup = true) {
    const tmp = `${this.file}.${randomUUID()}.tmp`;
    next.savedAt = new Date().toISOString();
    if (backup) await copyFile(this.file, join(this.directory, 'backups', 'previous-save.json'));
    await writeFile(tmp, JSON.stringify(next, null, 2) + '\n', { flag: 'wx' });
    await rename(tmp, this.file);
  }
  snapshot() { return structuredClone(this.state); }
  getCatalog(state = this.state) { return catalogFor(this.catalog, state); }
  action(type, payload = {}) {
    const run = this.queue.then(async () => {
      const next = this.snapshot();
      const catalog = this.getCatalog(next);
      if (type === 'search' || type === 'visit') {
        const location = locationsFor(catalog, next).find(l => l.id === payload.locationId && l.enabled);
        if (!location) throw new Error('Unknown location.');
        if (type === 'search' || !next.encounters[location.id]) {
          const searchNumber = next.searches[location.id] || 0;
          next.encounters[location.id] = createEncounters(catalog, location.id, next.settings.horsesPerSearch, searchNumber, location);
          next.searches[location.id] = searchNumber + 1;
        }
      } else if (type === 'catch' || type === 'sell') {
        let horse = next.horses.find(h => h.id === payload.id);
        const isCollected = !!horse;
        if (!horse) horse = Object.values(next.encounters).flat().find(h => h.id === payload.id);
        if (!horse) throw new Error('This horse has already left the clearing.');
        if (type === 'catch') {
          if (isCollected) throw new Error('This horse is already in your stable.');
          if (!next.settings.ignoreStableLimit && next.horses.length >= next.settings.stableCapacity) throw new Error('Your stable is full. Adjust capacity in Game Settings.');
          next.horses.push({ ...horse, name: payload.name === undefined ? horse.name : validateHorseName(payload.name), caughtAt: new Date().toISOString() });
        } else {
          next.horses = next.horses.filter(h => h.id !== horse.id);
          next.sold.push({ ...horse, soldAt: new Date().toISOString(), soldFor: next.settings.sellingPrice });
          next.gold += next.settings.sellingPrice;
          next.transactions.push({ id: randomUUID(), type: 'Horse sold', horseId: horse.id, amount: next.settings.sellingPrice, at: new Date().toISOString() });
        }
        for (const key of Object.keys(next.encounters)) next.encounters[key] = next.encounters[key].filter(h => h.id !== horse.id);
      } else if (type === 'rename' || type === 'favorite') {
        const horse = next.horses.find(h => h.id === payload.id);
        if (!horse) throw new Error('Horse not found in your stable.');
        if (type === 'rename') {
          horse.name = validateHorseName(payload.name);
        } else horse.favorite = !horse.favorite;
      } else if (type === 'horse-field') {
        if (!next.settings.developerEditMode) throw new Error('Enable Edit Mode to change horse details.');
        const horse = horseRecords(next).find(h => h.id === payload.id);
        if (!horse) throw new Error('Horse not found.');
        updateHorseField(horse,payload.field,payload.value,catalog,next);
      } else if (type === 'horse-notes') {
        const horse = horseRecords(next).find(h => h.id === payload.id);
        if (!horse) throw new Error('Horse not found.');
        if (typeof payload.notes !== 'string' || payload.notes.length > 4000) throw new Error('Notes must be 4,000 characters or fewer.');
        horse.notes = payload.notes;
      } else if (type === 'save-profile') {
        next.keeper = validateKeeper(payload);
      } else if (type === 'delete-profile') {
        delete next.keeper;
      } else if (type === 'delete-horse') {
        const exists = [...next.horses,...next.sold,...Object.values(next.encounters).flat()].some(h => h.id === payload.id);
        if (!exists) throw new Error('Horse not found.');
        next.horses = next.horses.filter(h => h.id !== payload.id);
        next.sold = next.sold.filter(h => h.id !== payload.id);
        for (const key of Object.keys(next.encounters)) next.encounters[key] = next.encounters[key].filter(h => h.id !== payload.id);
      } else if (type === 'delete-zone') {
        if (!locationsFor(catalog,next).some(l => l.id === payload.id)) throw new Error('Zone not found.');
        next.customLocations = next.customLocations.filter(l => l.id !== payload.id);
        next.deletedLocationIds = [...new Set([...(next.deletedLocationIds || []),payload.id])];
        delete next.encounters[payload.id];
        delete next.searches[payload.id];
        if (next.pageCopy) delete next.pageCopy[`wilds/${payload.id}`];
        if (next.pageCopy?.site) delete next.pageCopy.site[`nav-wilds-${payload.id}`];
      } else if (type === 'delete-definition') {
        const {kind,id} = payload;
        if (!Object.hasOwn(definitionKinds,kind)) throw new Error('Unknown definition type.');
        const entry = catalog[kind].find(d => d.id === id);
        if (!entry) throw new Error('Definition not found.');
        if (kind === 'siteThemes' && id === 'default') throw new Error('The original theme is kept as the fallback.');
        if (['species','palettes','eyes','personalities','atmospheres'].includes(kind) && catalog[kind].length === 1) throw new Error('Keep at least one entry of this type for the horse generator.');
        catalog[kind] = catalog[kind].filter(d => d.id !== id);
        if (kind === 'palettes') next.deletedBuiltinPalettes = [...new Set([...(next.deletedBuiltinPalettes || []),id])];
        if (['species','palettes'].includes(kind)) {
          const pool = kind === 'species' ? 'speciesPool' : 'palettePool';
          for (const zone of [...catalog.locations,...next.customLocations]) {
            zone[pool] = zone[pool].filter(name => name !== entry.name);
            if (!zone[pool].length) zone.enabled = false;
          }
        }
        if (kind === 'atmospheres') for (const zone of [...catalog.locations,...next.customLocations]) if (zone.atmosphere === id) zone.atmosphere = catalog.atmospheres[0].id;
        if (kind === 'themes') for (const item of catalog.items) if (item.theme === entry.name) item.theme = '';
        if (kind === 'siteThemes') {
          next.deletedWebsiteThemes = [...new Set([...(next.deletedWebsiteThemes || []),id])];
          if (next.settings.websiteTheme === id) next.settings.websiteTheme = 'default';
        }
        next.library = catalog;
      } else if (type === 'current-gold') {
        if (!Number.isSafeInteger(payload.gold) || payload.gold < 0 || payload.gold > 1000000000) throw new Error('Gold must be a whole number between 0 and 1,000,000,000.');
        const amount = payload.gold - next.gold;
        next.gold = payload.gold;
        next.transactions.push({ id:randomUUID(), type:'Developer balance adjustment', amount, at:new Date().toISOString() });
      } else if (type === 'settings') {
        for (const [key, min, max] of [['horsesPerSearch', 1, 12], ['sellingPrice', 0, 1000000], ['startingGold', 0, 1000000], ['stableCapacity', 1, 10000]]) {
          if (!Number.isInteger(payload[key]) || payload[key] < min || payload[key] > max) throw new Error(`${key} must be a whole number between ${min} and ${max}.`);
          next.settings[key] = payload[key];
        }
        if (typeof payload.ignoreStableLimit !== 'boolean') throw new Error('Stable limit override must be true or false.');
        next.settings.ignoreStableLimit = payload.ignoreStableLimit;
      } else if (type === 'save-zone') {
        const zone = validateZone(payload, catalog);
        const existing = payload.id ? locationsFor(catalog, next).find(l => l.id === payload.id) : null;
        if (payload.id && !existing) throw new Error('Zone not found.');
        if (locationsFor(catalog, next).some(l => l.id !== existing?.id && l.name.toLowerCase() === zone.name.toLowerCase())) throw new Error('A zone with that name already exists. Choose a different name.');
        const override = next.customLocations.find(l => l.id === payload.id);
        if (override) Object.assign(override, zone, { custom: existing.custom, event: existing.event });
        else if (existing) next.customLocations.push({ ...existing, ...zone, custom: existing.custom, event: existing.event, id: existing.id });
        else next.customLocations.push({ ...zone, id: `zone-${randomUUID()}` });
      } else if (type === 'save-definition') {
        const { kind, id, values } = payload;
        const definition = validateDefinition(kind, values);
        const existing = id ? catalog[kind].find(d => d.id === id) : null;
        if (id && !existing) throw new Error('Definition not found.');
        if (kind === 'siteThemes' && id === 'default') throw new Error('The original theme is preserved. Duplicate it to customize a copy.');
        if (catalog[kind].some(d => d.id !== id && d.name.toLowerCase() === definition.name.toLowerCase() && (kind !== 'mutations' || d.type === definition.type))) throw new Error('That name is already in use. Choose another name.');
        const updated = { ...existing, ...definition, id: existing?.id || `${kind}-${randomUUID()}` };
        if (existing) catalog[kind] = catalog[kind].map(d => d.id === id ? updated : d);
        else catalog[kind].push(updated);
        // Rewrite future pool references as one atomic transaction; horse snapshots stay intact.
        if (existing && existing.name !== updated.name && ['species', 'palettes'].includes(kind)) {
          const pool = kind === 'species' ? 'speciesPool' : 'palettePool';
          for (const location of [...catalog.locations, ...next.customLocations]) {
            location[pool] = location[pool].map(name => name === existing.name ? updated.name : name);
          }
        }
        if (existing && kind === 'themes' && existing.name !== updated.name) {
          for (const item of catalog.items) if (item.theme === existing.name) item.theme = updated.name;
        }
        next.library = catalog;
      } else if (type === 'website-theme') {
        if (!catalog.siteThemes.some(t => t.id === payload.id)) throw new Error('Choose an available website theme.');
        if (payload.mode !== undefined && !['dark','light'].includes(payload.mode)) throw new Error('Choose dark or light mode.');
        next.settings.websiteTheme = payload.id;
        next.settings.websiteThemeMode = payload.mode || 'dark';
      } else if (type === 'developer-edit-mode') {
        if (typeof payload.enabled !== 'boolean') throw new Error('Choose whether edit mode is enabled.');
        next.settings.developerEditMode = payload.enabled;
      } else if (type === 'save-copy') {
        const entries = validateCopyPatch(payload);
        next.pageCopy ??= {};
        const page = { ...(next.pageCopy[payload.scope] || {}) };
        for (const [key,text] of Object.entries(entries)) {
          if (text === null) delete page[key];
          else page[key] = text;
        }
        if (Object.keys(page).length) next.pageCopy[payload.scope] = page;
        else delete next.pageCopy[payload.scope];
      } else if (type === 'backup') {
        await writeFile(join(this.directory, 'backups', `save-${Date.now()}-${randomUUID().slice(0, 8)}.json`), JSON.stringify(next, null, 2) + '\n', { flag: 'wx' });
      } else throw new Error('Unknown action.');
      await this.persist(next);
      this.state = next;
      return this.snapshot();
    });
    this.queue = run.catch(() => {});
    return run;
  }
}
