import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeCatalog} from '../public/definitions.js';
import {createEncounters} from '../src/encounters.js';
import {profileContent} from '../public/profile.js';
import {selectProfileTab} from '../public/profile-layout.js';
const catalog=normalizeCatalog(JSON.parse(await readFile(new URL('../data/definitions/catalog.json',import.meta.url),'utf8')));
const settings=JSON.parse(await readFile(new URL('../data/defaults/settings.json',import.meta.url),'utf8'));
const horse=createEncounters(catalog,'aetherion',1,0,undefined,()=>0.5)[0];
const state={horses:[],sold:[],settings};

test('horse profile separates overview from appearance and keeps unique portrait IDs',()=>{
 const html=profileContent(horse,state,{catalog});
 assert.equal((html.match(/role="tab"/g)||[]).length,2);
 assert.equal((html.match(/role="tabpanel"/g)||[]).length,2);
 const overview=html.split('data-profile-panel="overview">')[1].split('data-profile-panel="appearance"')[0];
 const appearance=html.split('data-profile-panel="appearance"')[1];
 assert.match(overview,/horse-facts/);assert.match(overview,/>Equipment<\/h3>/);assert.match(overview,/>Skills<\/h3>/);
 assert.doesNotMatch(overview,/class="color-regions"|class="horse-notes"/);
 assert.match(appearance,/class="color-regions"/);assert.match(appearance,/>Traits<\/h3>/);assert.match(appearance,/>Mutations<\/h3>/);
 assert.equal((html.match(/viewBox="240 25 135 145"/g)||[]).length,2);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length);
 const owned=profileContent({...horse,notes:'Keep this note'},{...state,horses:[horse]},{catalog});
 assert.match(owned,/horse-notes-form/);assert.match(owned,/Keep this note/);
 assert.match(owned,/data-action="sell"/);assert.match(owned,/data-action="export-horse"/);
 const preview=profileContent(horse,state,{catalog,importPreview:true});
 assert.match(preview,/id="import-horse-appearance"/);assert.match(preview,/data-action="confirm-import"/);
 assert.doesNotMatch(preview,/data-action="sell"|data-action="export-horse"/);
});

test('switching profile tabs hides inactive content and supports focus without replacing forms',()=>{
 const tabs=['overview','appearance'].map(key=>({dataset:{profileTab:key},setAttribute(name,value){this[name]=value;},focus(){this.focused=true;}}));
 const panels=['overview','appearance'].map(key=>({dataset:{profilePanel:key}}));
 const root={querySelectorAll(selector){return selector==='[data-profile-tab]' ? tabs : panels;}};
 selectProfileTab(root,'appearance',{focus:true});
 assert.equal(tabs[1]['aria-selected'],'true');assert.equal(tabs[1].tabIndex,0);assert.equal(tabs[1].focused,true);
 assert.equal(tabs[0].tabIndex,-1);assert.equal(panels[0].hidden,true);assert.equal(panels[1].hidden,false);
 selectProfileTab(root,'overview');assert.equal(panels[0].hidden,false);assert.equal(panels[1].hidden,true);
});
