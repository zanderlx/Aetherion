import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ConfigurationFiles} from '../src/configuration.js';
import {createEncounters} from '../src/encounters.js';
import {horseCardRank} from '../public/horse-rank.js';
import {isCosmicPalette} from '../public/cosmic-types.js';

// Read configuration only. Never initialize GameStore or write player/config files.
const root=fileURLToPath(new URL('../',import.meta.url));
const base=JSON.parse(await readFile(resolve(root,'data/definitions/catalog.json'),'utf8'));
const {catalog,zones}=await new ConfigurationFiles(resolve(root,'data')).read(base);
const regularPerZone=Number(process.argv[2] || 500000);
const wildPerZone=Number(process.argv[3] || 100000);
for(const value of [regularPerZone,wildPerZone]) if(!Number.isSafeInteger(value) || value<1 || value>10000000) throw new Error('Simulation counts must be positive whole numbers up to 10,000,000.');
const enabled=zones.filter(zone=>zone.enabled);
const started=Date.now();
const report={startedAt:new Date().toISOString(),regularPerZone,wildPerZone,batchSize:6,cosmicSettings:catalog.spawning.cosmic,cosmicProbability:catalog.spawning.cosmic.reduce((sum,entry)=>sum+entry.chance,0)/100,standardPoolCosmicNames:catalog.mutations.filter(m=>m.type==='Standard' && isCosmicPalette(m)).map(m=>m.name),cosmicRankedSpecies:catalog.species.filter(s=>s.rarityTier===0).map(s=>s.name),runs:[]};
for(const mode of ['normal','wild-only']) {
 const registry=mode==='normal' ? catalog : structuredClone(catalog);
 if(mode==='wild-only') registry.spawning.cosmic.forEach(entry=>entry.chance=0);
 for(const zone of enabled) {
  const limit=mode==='normal' ? regularPerZone : wildPerZone;
  const stats={mode,zone:zone.id,horses:0,paths:{Wild:0,Cosmic:0},cosmicTypes:{Solar:0,Lunar:0,Heavenly:0,Void:0,Astral:0},wildCosmicMutations:0,wildCosmicPalettes:0,wildCosmicRanks:0,cosmicPaletteMismatch:0,cosmicMutationMismatch:0,cosmicMissingSpecial:0,invalidProfiles:0,anomalySamples:[],blocksOf30:0,blocksWithAtLeastTwoCosmics:0,blocksWithSolarAndVoid:0,afterCosmic:{horses:0,cosmics:0}};
  let blockCount=0,blockCosmics=0,blockSolar=false,blockVoid=false,previousCosmic=false,nextProgress=100000;
  while(stats.horses<limit) {
   // This is the same encounter batching entry point used by Search the Wilds.
   const horses=createEncounters(registry,zone.id,Math.min(6,limit-stats.horses),0,zone);
   for(const horse of horses) {
    stats.horses++;stats.paths[horse.spawnPath]++;
    const cosmic=horse.spawnPath==='Cosmic';
    const special=horse.specialSpawn;
    const namedMutations=horse.mutations.filter(m=>isCosmicPalette({name:typeof m==='string'?m:m.name}));
    const rank=horseCardRank(horse,registry);
    let anomaly=false;
    if(cosmic) {
     stats.cosmicTypes[special]=(stats.cosmicTypes[special] || 0)+1;
     if(!special) {stats.cosmicMissingSpecial++;anomaly=true;}
     if(horse.palette.name!==special) {stats.cosmicPaletteMismatch++;anomaly=true;}
     const configured=registry.spawning.cosmic.find(entry=>entry.name===special);
     if(!configured || horse.mutations[0]?.id!==configured.mutationId) {stats.cosmicMutationMismatch++;anomaly=true;}
    } else {
     if(namedMutations.length) {stats.wildCosmicMutations++;anomaly=true;}
     if(isCosmicPalette(horse.palette)) {stats.wildCosmicPalettes++;anomaly=true;}
     if(rank.key==='cosmic') {stats.wildCosmicRanks++;anomaly=true;}
    }
    if(!horse.id || horse.mutations.length>4 || !horse.eye?.id || !horse.personality?.id || !horse.palette.complete) {stats.invalidProfiles++;anomaly=true;}
    if(anomaly && stats.anomalySamples.length<10) stats.anomalySamples.push({path:horse.spawnPath,special,rank:rank.key,species:horse.species,palette:horse.palette.name,mutations:horse.mutations.map(m=>m.name)});
    if(previousCosmic) {stats.afterCosmic.horses++;if(cosmic) stats.afterCosmic.cosmics++;}
    previousCosmic=cosmic;
    blockCount++;if(cosmic) blockCosmics++;
    blockSolar ||= special==='Solar';blockVoid ||= special==='Void';
    if(blockCount===30) {
     stats.blocksOf30++;if(blockCosmics>=2) stats.blocksWithAtLeastTwoCosmics++;if(blockSolar && blockVoid) stats.blocksWithSolarAndVoid++;
     blockCount=0;blockCosmics=0;blockSolar=false;blockVoid=false;
    }
   }
   if(stats.horses>=nextProgress) {console.log(`${mode} / ${zone.name}: ${stats.horses.toLocaleString()} profiles, ${stats.paths.Cosmic} Cosmic, ${stats.wildCosmicMutations} Wild-path Cosmic mutations`);nextProgress+=100000;}
  }
  stats.cosmicPercent=100*stats.paths.Cosmic/stats.horses;
  report.runs.push(stats);
 }
}
const n=30,p=report.cosmicProbability;
report.expectedAtLeastTwoIn30=1-(1-p)**n-n*p*(1-p)**(n-1);
report.expectedSolarAndVoidIn30=1-(1-0.001)**n-(1-0.0005)**n+(1-0.0015)**n;
report.elapsedSeconds=(Date.now()-started)/1000;
const directory=resolve(root,'docs/reports');await mkdir(directory,{recursive:true});
const path=resolve(directory,'spawn-audit-2026-10-22.json');
await writeFile(path,JSON.stringify(report,null,2)+'\n');
console.log(`Saved audit report: ${path}`);
console.log(JSON.stringify(report,null,2));