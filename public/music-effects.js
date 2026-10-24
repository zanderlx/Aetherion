import {isCosmicPalette} from './cosmic-types.js';
export const soundEffectGroups=[{id:'events',name:'Events',items:[{id:'effect/cosmic-spawn',name:'Cosmic Horse Spawn'}]}];
export const isSoundEffect=track=>track?.kind==='effect';
export function newCosmicEncounters(previous,next,zone){
 const seen=new Set(Object.values(previous?.encounters||{}).flat().map(h=>h.id));
 return (next?.encounters?.[zone]||[]).filter(h=>!seen.has(h.id)&&(h.spawnPath==='Cosmic'||isCosmicPalette({name:h.specialSpawn})));
}
