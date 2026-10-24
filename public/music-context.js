export function musicContext(route){
  if(route.startsWith('wilds/'))return route;
  if(route.startsWith('stable/'))return 'stable';
  if(route.startsWith('town/'))return 'town';
  return null; // Settings and compendium keep the current music.
}
export function selectedMusic(library,context){return library.assignments[context]??library.assignments.default??'menu';}
export function musicContexts(locations){return [{id:'default',name:'Default / Main Menu'},{id:'stable',name:'Stables'},{id:'town',name:'Town'},...locations.map(z=>({id:'wilds/'+z.id,name:z.name}))];}
