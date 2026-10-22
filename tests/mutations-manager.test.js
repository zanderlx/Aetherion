import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterMutations,mutationCards,mutationsManagerPage} from '../public/mutations-manager.js';
const mutations=[
 {id:'solar',name:'Solar',type:'Cosmic',description:'Sunlit coat',weight:0},
 {id:'springy',name:'Springy Tendons',type:'Standard',description:'Jump higher',weight:2333},
 {id:'lungs',name:'Powerful Lungs',type:'Standard',description:'More stamina',weight:1675}
];
test('mutation grid searches descriptions and combines type and sort filters',()=>{
 assert.deepEqual(filterMutations(mutations,'stamina','Standard').map(m=>m.id),['lungs']);
 assert.deepEqual(filterMutations(mutations,'','Standard','weight').map(m=>m.id),['springy','lungs']);
 assert.deepEqual(filterMutations(mutations,'','','za').map(m=>m.id),['springy','solar','lungs']);
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
test('mutation manager keeps its global spawning toggle and card grid without inline editor',()=>{
 const html=mutationsManagerPage({mutations});
 assert.match(html,/Create Mutation/);
 assert.match(html,/name="ALLOW_DUPLICATE_MUTATIONS"/);
 assert.match(html,/4,008 tickets/);
 assert.match(html,/id="mutation-search"/);
 assert.match(html,/id="mutation-type"/);
 assert.match(html,/id="mutation-sort"/);
 assert.equal((html.match(/class="panel eye-definition-card/g) || []).length,3);
 assert.doesNotMatch(html,/id="definition-form"|Your collection of options/);
});
