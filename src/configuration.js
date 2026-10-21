import {mkdir,readFile,writeFile,rename,unlink} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
import {randomUUID} from 'node:crypto';
import {normalizeCatalog,validateDefinition} from '../public/definitions.js';
import {locationsFor} from '../public/zones.js';
import {registryKinds,defaultSpawnSettings,standardTokens,rarityTier,systemID,validateSpawnSettings,zoneCreatures,validateCreatures} from '../public/spawn-config.js';

const safeID = id => typeof id === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(id);
export class ConfigurationFiles {
  constructor(directory) { this.root = resolve(directory,'config'); }
  path(relative) {
    const path = resolve(this.root,relative);
    if (!path.startsWith(this.root+sep)) throw new Error('Invalid configuration path.');
    return path;
  }
  async json(relative) { return JSON.parse(await readFile(this.path(relative),'utf8')); }
  async atomic(relative,value) {
    const path = this.path(relative);
    if (value === null) { await unlink(path).catch(e => {if (e.code !== 'ENOENT') throw e;}); return; }
    await mkdir(resolve(path,'..'),{recursive:true});
    const temporary = `${path}.${randomUUID()}.tmp`;
    await writeFile(temporary,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    await rename(temporary,path);
  }
  async apply(files) { for (const [path,value] of Object.entries(files)) await this.atomic(path,value); }
  async recover(state) {
    let journal;
    try { journal = await this.json('transaction.json'); } catch(e) { if (e.code === 'ENOENT') return; throw e; }
    if (!journal || !journal.before || !journal.after || !safeID(journal.revision)) throw new Error('Invalid configuration recovery journal; files preserved.');
    // The player-save revision is the commit marker for the entire set of JSON files.
    await this.apply(state.configurationRevision === journal.revision ? journal.after : journal.before);
    await unlink(this.path('transaction.json'));
  }
  seed(base,state) {
    const catalog = normalizeCatalog(base);
    catalog.species = catalog.species.map(s => ({...s,rarityTier:rarityTier(s),attributes:s.attributes || {}}));
    for (const [name,weight] of Object.entries(standardTokens)) {
      const existing = catalog.mutations.find(m => m.name === name && m.type === 'Standard');
      if (existing) Object.assign(existing,{weight,thresholds:existing.thresholds || {},sizeShift:existing.sizeShift ?? (name === 'Dwarfism' ? -1 : name === 'Gigantism' ? 1 : 0)});
      else catalog.mutations.push({id:`mutation-${systemID(name)}`,name,description:'',type:'Standard',weight,thresholds:{},sizeShift:name === 'Dwarfism' ? -1 : name === 'Gigantism' ? 1 : 0});
    }
    catalog.personalities = catalog.personalities.map(p => ({...p,systemId:p.systemId || p.id,behaviorTags:p.behaviorTags || []}));
    const settings = structuredClone(defaultSpawnSettings);
    const zones = locationsFor(catalog,state).map(z => ({...z,creatures:zoneCreatures(z,catalog,settings)}));
    return {catalog,zones,settings};
  }
  async exists() {
    try { await this.json('index.json'); return true; } catch(e) { if (e.code === 'ENOENT') return false; throw e; }
  }
  async read(base) {
    const index = await this.json('index.json');
    if (index.version !== 1 || !Array.isArray(index.zoneIds) || index.zoneIds.some(id => !safeID(id)) || new Set(index.zoneIds).size !== index.zoneIds.length) throw new Error('Invalid config/index.json.');
    const catalog = normalizeCatalog(base);
    for (const kind of registryKinds) {
      const entries = await this.json(`${kind}.json`);
      if (!Array.isArray(entries) || entries.length > 10000 || (!entries.length && kind !== 'mutations') || entries.some(e => !safeID(e.id)) || new Set(entries.map(e => e.id)).size !== entries.length) throw new Error(`Invalid ${kind}.json registry.`);
      catalog[kind] = entries.map(entry => {
        if (kind === 'palettes' && entry.complete === false) return entry; // Preserve incomplete imported reference palettes, never spawn them.
        return {...entry,...validateDefinition(kind,entry)};
      });
      const keys = entries.map(e => `${kind === 'mutations' ? e.type : ''}:${e.name?.toLowerCase()}`);
      if (new Set(keys).size !== keys.length) throw new Error(`Duplicate names in ${kind}.json.`);
    }
    const settings = validateSpawnSettings(await this.json('spawn-settings.json'));
    for (const p of catalog.palettes) if ((p.speciesIds || []).some(id => !catalog.species.some(s => s.id === id))) throw new Error('A palette refers to an unknown species ID.');
    const personalityIDs = catalog.personalities.map(p => p.systemId);
    if (new Set(personalityIDs).size !== personalityIDs.length) throw new Error('Personality system IDs must be unique.');
    const zones = [];
    for (const id of index.zoneIds) {
      const z = await this.json(`zones/${id}.json`);
      if (z.id !== id || typeof z.name !== 'string' || !z.name.trim() || typeof z.enabled !== 'boolean' || !Array.isArray(z.palettePool) || z.palettePool.some(n => !catalog.palettes.some(p => p.name === n && p.complete))) throw new Error(`Invalid zone file: ${id}.json.`);
      const creatures = validateCreatures(z.creatures,catalog);
      zones.push({...z,creatures,speciesPool:creatures.map(c => catalog.species.find(s => s.id === c.speciesId).name),enabled:z.enabled && creatures.some(c => Math.abs(c.weight)>0) && z.palettePool.length>0});
    }
    catalog.locations = zones;
    catalog.traits = Object.fromEntries(catalog.species.map(s => [s.name,s.traits]));
    catalog.spawning = settings;
    return {catalog,zones,settings};
  }
  documents({catalog,zones,settings}) {
    const files = Object.fromEntries(registryKinds.map(kind => [`${kind}.json`,catalog[kind]]));
    files['spawn-settings.json'] = settings;
    files['index.json'] = {version:1,zoneIds:zones.map(z => z.id)};
    for (const zone of zones) {
      if (!safeID(zone.id)) throw new Error('Invalid zone ID.');
      files[`zones/${zone.id}.json`] = {...zone,creatures:zoneCreatures(zone,catalog,settings)};
    }
    return files;
  }
  async commit(configuration,persistPlayer) {
    const after = this.documents(configuration), before = {};
    let previous = [];
    try { previous = (await this.json('index.json')).zoneIds; } catch(e) { if (e.code !== 'ENOENT') throw e; }
    for (const id of previous) if (!configuration.zones.some(z => z.id === id)) after[`zones/${id}.json`] = null;
    for (const path of Object.keys(after)) {
      try { before[path] = await this.json(path); } catch(e) { if (e.code !== 'ENOENT') throw e; before[path] = null; }
    }
    const revision = randomUUID();
    await this.atomic('transaction.json',{revision,before,after});
    try {
      await this.apply(after);
      await persistPlayer(revision);
    } catch(error) {
      await this.apply(before);
      await unlink(this.path('transaction.json'));
      throw error;
    }
    // A failed cleanup is harmless: startup recovers the committed revision.
    await unlink(this.path('transaction.json')).catch(() => {});
  }
}
