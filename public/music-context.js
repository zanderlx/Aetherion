export const defaultMusicTrack={id:'menu',name:'Glades of Gallorin',filename:'main-menu.mp3',durationSeconds:178.104};
export function formatMusicName(filename){
 return String(filename||'Untitled').replace(/\.mp3$/i,'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/([a-zA-Z])(\d)/g,'$1 $2').replace(/(\d)([a-zA-Z])/g,'$1 $2').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim().replace(/\b[a-z]/g,c=>c.toUpperCase());
}
const sectionDefinitions=[
 ['Stables','stable',[['stable/all','My Horses'],['stable/breeding','Breeding']]],
 ['Town','town',[['town/cave','Ancient Cave'],['town/digsite','Digsite'],['town/gacha','Gacha Machine'],['town/plush','Plush Machine'],['town/spirit','Spirit Tame']]],
 ['Inventory','inventory',[['inventory/accessories','Accessories'],['inventory/potions','Potions']]],
 ['Compendium','compendium',[['dev/species','Species'],['dev/traits','Traits'],['dev/colors','Palettes'],['dev/eyes','Eye Colors'],['dev/personalities','Personalities'],['dev/mutations','Mutations'],['dev/rarities','Rarities'],['dev/locations','Zones'],['dev/atmospheres','Zone Atmospheres'],['dev/items','Items & Potions'],['dev/themes','Item Themes']]],
 ['User Interface','user-interface',[['dev/appearance','Appearance & Themes'],['dev/music','Music'],['dev/profile','My Profile']]],
 ['Developer Settings','developer',[['dev/edit-mode','Edit Mode'],['dev/settings','Game Settings'],['dev/horse-updates','Horse Updates'],['dev/roadmap','Remaining Features'],['dev/saves','Save Management']]]
];
export function musicGroups(locations=[]){
 const groups=sectionDefinitions.map(([name,id,items])=>({name,id,items:[{id,name:'All '+name},...items.map(([id,name])=>({id,name}))]}));
 groups.splice(3,0,{name:'Wilds',id:'wilds',items:[{id:'wilds',name:'All Wilds'},...locations.map(z=>({id:'wilds/'+z.id,name:z.name}))]});
 return [{name:'General',id:'general',items:[{id:'default',name:'Default'},{id:'main-menu',name:'Main Menu'}]},...groups];
}
export const musicContexts=locations=>musicGroups(locations).flatMap(g=>g.items);
export function musicParent(context){
 if(context.startsWith('wilds/'))return 'wilds';
 for(const [,id,items] of sectionDefinitions)if(items.some(([route])=>route===context))return id;
 return null;
}
export function assignmentTracks(value){return Array.isArray(value)?value:typeof value==='string'&&value?[value]:[];}
export function playlistSource(library,context){
 const assignments=library.assignments||{},parent=musicParent(context);
 return [context,parent,'default'].find(key=>key&&Object.hasOwn(assignments,key)&&(Array.isArray(assignments[key])||assignmentTracks(assignments[key]).length))||'default';
}
export function selectedPlaylist(library,context){
 const source=playlistSource(library,context);
 return Object.hasOwn(library.assignments||{},source)?assignmentTracks(library.assignments[source]):['menu'];
}
export function selectedMusic(library,context){return selectedPlaylist(library,context)[0];}
export function musicContext(route,library={assignments:{}}){
 if(/^(wilds|stable|town|inventory)\//.test(route))return route;
 if(route.startsWith('dev/')){
  const parent=musicParent(route);
  return Object.hasOwn(library.assignments||{},route)||Object.hasOwn(library.assignments||{},parent)?route:null;
 }
 return null;
}

export function formatMusicDuration(value){if(!Number.isFinite(value)||value<0)return '—';const seconds=Math.floor(value);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
