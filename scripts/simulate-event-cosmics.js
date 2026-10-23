import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ConfigurationFiles} from '../src/configuration.js';
import {createEncounters} from '../src/encounters.js';
import {randomFloat} from '../src/spawning.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const base=JSON.parse(await readFile(resolve(root,'data/definitions/catalog.json'),'utf8'));
const {catalog,zones}=await new ConfigurationFiles(resolve(root,'data')).read(base);
const zone=zones.find(zone=>zone.id==='aetherion');
const allowed=new Set(zone.creatures.filter(c=>Math.abs(c.weight)>0).map(c=>c.speciesId));
const eligible=catalog.species.filter(species=>allowed.has(species.id));
const probability=catalog.spawning.cosmic.reduce((sum,c)=>sum+c.chance,0)/100;
const count=Number(process.argv[2] || 100000);
if(!Number.isSafeInteger(count) || count<1 || count>1000000 || probability<=0) throw new Error('Choose 1–1,000,000 profiles with a nonzero Cosmic chance.');
const report={startedAt:new Date().toISOString(),mode:'Cosmic-conditioned diagnostic: only the first random roll is restricted to the Cosmic interval; all other rolls use production crypto randomness',trials:count,configuredCosmicPercent:probability*100,registeredSpecies:catalog.species.length,registeredEventSpecies:catalog.species.filter(s=>s.event).length,eligibleSpecies:eligible.map(s=>s.name),eligibleEventSpecies:eligible.filter(s=>s.event).map(s=>s.name),cosmicTypes:{},speciesCounts:{},eventCosmics:0,nonCosmicResults:0,requestedSpecies:{},theoreticalEventCosmicPercent:probability*100*eligible.filter(s=>s.event).length/eligible.length};
const started=Date.now();
for(let i=0;i<count;i++) {
 let initial=true;
 const rng=()=>{const value=randomFloat();if(initial){initial=false;return value*probability;}return value;};
 const [horse]=createEncounters(catalog,zone.id,1,0,zone,rng);
 if(horse.spawnPath!=='Cosmic') report.nonCosmicResults++;
 report.cosmicTypes[horse.specialSpawn]=(report.cosmicTypes[horse.specialSpawn] || 0)+1;
 report.speciesCounts[horse.species]=(report.speciesCounts[horse.species] || 0)+1;
 if(horse.speciesEvent) report.eventCosmics++;
 if((i+1)%25000===0) console.log(`${(i+1).toLocaleString()} complete Cosmic profiles: ${report.eventCosmics} event species`);
}
for(const name of ['Ghoulsteed','Hauntmare','Heartbane','Hollyhoof','Honeytrot']) {
 const species=catalog.species.find(s=>s.name===name);
 report.requestedSpecies[name]={registered:!!species,eligible:!!species && allowed.has(species.id),observed:report.speciesCounts[name] || 0};
}
report.elapsedSeconds=(Date.now()-started)/1000;
await mkdir(resolve(root,'docs/reports'),{recursive:true});
await writeFile(resolve(root,'docs/reports/event-cosmic-audit-2026-10-22.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(report.nonCosmicResults) throw new Error('Cosmic-conditioned test generated a Wild profile.');