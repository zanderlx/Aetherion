import {test} from 'node:test';
import assert from 'node:assert/strict';
import {musicManagerPage} from '../public/music-manager.js';
test('music manager groups playlist tables by navigation and uses requested labels',()=>{
 const html=musicManagerPage({tracks:[{id:'test',name:'Sample Song'}],assignments:{'stable/all':['test']},fadeSeconds:2},[{id:'aetherion',name:'Aetherion Wilds'}]);
 for(const title of ['Stables','My Horses','Breeding','Town','Wilds','Aetherion Wilds','Main Menu'])assert.ok(html.includes(title),title);
 assert.ok(html.includes('Import Music'));assert.ok(html.includes('Gallorin Studios'));assert.ok(html.includes('(default)'));
 assert.ok(!html.includes('data-playlist-add'));assert.ok(!html.includes('data-playlist-move'));assert.ok(html.includes('data-playlist-remove="stable/all"'));
 assert.ok(html.includes('<table'));assert.ok(!html.includes('built-in'));assert.ok(!html.includes('Choose the music for each location'));
});

test('playlist cards collapse, show duration and counts, and can remove inherited songs',()=>{
 const html=musicManagerPage({tracks:[],assignments:{'stable/all':[]},fadeSeconds:2},[]);
 assert.ok(html.includes('<details class="music-playlist"'));
 assert.ok(html.includes('Duration'));assert.ok(html.includes('2:58'));
 assert.ok(html.includes('Glades of Gallorin'));
 assert.ok(html.includes('0 songs'));assert.ok(!html.includes('Using Default'));
 assert.ok(html.includes('data-playlist-remove="default"'));
 assert.ok(!html.includes('data-fade'));assert.ok(html.includes('data-audio-settings'));
});

test('row controls share the numbered column and song counts sit next to chevrons',()=>{
 const html=musicManagerPage({tracks:[{id:'test',name:'Sample',durationSeconds:90}],assignments:{'stable/all':['test']},fadeSeconds:2},[]);
 assert.ok(html.includes('music-row-number'));assert.ok(html.includes('music-row-play'));
 assert.ok(html.includes('music-row-trash'));assert.ok(html.includes('data-playlist-context="stable/all"'));
 assert.ok(html.includes('1:30'));
 assert.match(html,/<h3>My Horses<\/h3><span class="music-playlist-count">1 song<\/span><span class="music-chevron"/);
});
