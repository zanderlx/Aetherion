import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterMutations,mutationCards,mutationResults,mutationsManagerPage} from '../public/mutations-manager.js';
import {libraryEditorPage} from '../public/library-editor.js';
import {catalogFor} from '../public/definitions.js';
import {readFile} from 'node:fs/promises';
const mutations=[
 {id:'solar',name:'Solar',type:'Cosmic',description:'Sunlit coat',weight:0},
 {id:'springy',name:'Springy Tendons',type:'Standard',description:'Jump higher',weight:2333},
 {id:'lungs',name:'Powerful Lungs',type:'Standard',description:'More stamina',weight:1675}
];
test('mutation types form a dropdown and sort into separate named sections',async()=>{
 const entries=[...mutations,{id:'special',name:'Zeta',type:'Special'},{id:'mutated',name:'Alpha',type:'Mutated'}];
 const html=mutationResults(filterMutations(entries,'','','type'));
 assert.ok(html.indexOf('<h2>Standard</h2>')<html.indexOf('<h2>Special</h2>'));
 assert.ok(html.indexOf('<h2>Special</h2>')<html.indexOf('<h2>Mutated</h2>'));
 assert.doesNotMatch(mutationResults(entries,'az'),/<section/);
 const catalog=catalogFor(JSON.parse(await readFile(new URL('../data/definitions/catalog.json',import.meta.url),'utf8')),{});
 const form=libraryEditorPage('mutations',catalog,{settings:{}},catalog.mutations[0]);
 assert.match(form,/<select name="type">/);
 for (const type of ['Standard','Special','Mutated']) assert.match(form,new RegExp(`value="${type}"`));
 assert.doesNotMatch(form,/<input name="type"/);
 assert.doesNotMatch(form,/name="systemId"|System ID/);
 assert.match(form,/Selection Weight \(0 = disabled\)/);
});
test('mutation grid searches descriptions and combines type and sort filters',()=>{
 assert.deepEqual(filterMutations(mutations,'stamina','Standard').map(m=>m.id),['lungs']);
 assert.deepEqual(filterMutations(mutations,'','Standard','weight').map(m=>m.id),['springy','lungs']);
 assert.deepEqual(filterMutations(mutations,'','','name','desc').map(m=>m.id),['springy','solar','lungs']);
 assert.deepEqual(filterMutations(mutations,'sunlit','Standard'),[]);
 assert.equal(mutations[0].id,'solar');
});
test('mutation cards expose modal edit actions and safely render names and descriptions',()=>{
 const html=mutationCards([{...mutations[0],name:'<script>Solar</script>',description:'<img src=x>'}]);
 assert.match(html,/data-action="edit-definition" data-kind="mutations"/);
 assert.match(html,/&lt;script&gt;Solar&lt;\/script&gt;/);
 assert.doesNotMatch(html,/<script>|<img/);
 assert.match(html,/Cosmic/);
});
test('mutation manager shows its card grid without gameplay settings or inline editor',()=>{
 const html=mutationsManagerPage({mutations});
 assert.match(html,/Create Mutation/);
 assert.doesNotMatch(html,/name="ALLOW_DUPLICATE_MUTATIONS"/);

 assert.match(html,/id="mutation-search"/);
 assert.match(html,/id="mutation-type"/);
 assert.match(html,/id="mutation-sort"/);
 assert.match(html,/id="mutation-weights" type="checkbox"/);
 assert.match(html,/data-action="mutation-sort-direction"/);
 assert.doesNotMatch(html,/value="az"|value="za"|Tokens|Weight: /);
 assert.match(mutationCards(mutations,true),/Weight: 2,333/);
 assert.deepEqual(filterMutations(mutations,'','','weight','asc').map(m=>m.id),['solar','lungs','springy']);
 assert.equal((html.match(/class="panel eye-definition-card/g) || []).length,3);
 assert.doesNotMatch(html,/id="definition-form"|Your collection of options/);
});
