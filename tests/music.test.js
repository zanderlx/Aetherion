import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {MusicLibrary} from '../src/music-library.js';
import {musicContext,selectedMusic,selectedPlaylist,formatMusicName} from '../public/music-context.js';
import {createMusicEngine} from '../public/music-engine.js';
const mp3=Buffer.from('ID3test audio');
test('music imports persist, validate, assign independently, and delete without leaving assignments',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'gallorin-music-'));
 t.after(()=>rm(directory,{recursive:true,force:true}));
 const store=new MusicLibrary(directory);
 await assert.rejects(store.import('bad.mp3',Buffer.from('invalid')),/valid MP3/);
 await assert.rejects(store.import('bad.exe',mp3),/MP3/);
 const first=await store.import('Song A.mp3',mp3),id=first.tracks[0].id;
 const second=await store.import('Song B.mp3',mp3),id2=second.tracks[1].id;
 assert.equal(second.tracks[0].name,'Song A');
 assert.deepEqual(await readFile(join(directory,'music',id+'.mp3')),mp3);
 const assignments={'wilds/aetherion':id,'wilds/hallowhoof':id2,stable:id2,default:'menu'};
 await store.settings({assignments,fadeSeconds:2},Object.keys(assignments));
 assert.deepEqual((await new MusicLibrary(directory).read()).assignments,Object.fromEntries(Object.entries(assignments).map(([key,value])=>[key,[value]])));
 await assert.rejects(store.settings({assignments:{unknown:id},fadeSeconds:2},['default']),/existing song/);
 await assert.rejects(store.settings({assignments:{default:'missing'},fadeSeconds:2},['default']),/existing song/);
 await assert.rejects(store.settings({assignments:{},fadeSeconds:11},[]),/fade/);
 const final=await store.remove(id);
 assert.equal(final.tracks.length,1);assert.deepEqual(final.assignments['wilds/aetherion'],[]);
 assert.deepEqual(final.assignments['wilds/hallowhoof'],[id2]);
 await assert.rejects(store.remove('../save'),/not found/);
 assert.deepEqual(selectedPlaylist(final,'wilds/aetherion'),[]);
});
test('location music uses zone-specific choices and keeps music through configuration pages',()=>{
 assert.equal(musicContext('wilds/hallowhoof'),'wilds/hallowhoof');
 assert.equal(musicContext('stable/all'),'stable/all');assert.equal(musicContext('town/gacha'),'town/gacha');
 assert.equal(musicContext('dev/music'),null);
 assert.equal(selectedMusic({assignments:{default:'a',stable:'b'}},'stable'),'b');
 assert.equal(selectedMusic({assignments:{default:'a'}},'town'),'a');
});
function fakeAudio(){return {volume:1,muted:false,paused:true,currentTime:0,duration:120,async play(){this.paused=false;},pause(){this.paused=true;},load(){},removeAttribute(){}};}
test('audio crossfades smoothly, preserves pause intent, seeks and stops',async()=>{
 let now=0,frames=[],players=[];
 const original=fakeAudio();players.push(original);
 const engine=createMusicEngine({audio:original,makeAudio:()=>{const a=fakeAudio();players.push(a);return a;},clock:()=>now,frame:fn=>frames.push(fn)});
 const tick=value=>{now=value;const callbacks=frames;frames=[];callbacks.forEach(fn=>fn());};
 await engine.command({type:'select',track:{id:'a',url:'a'},fadeSeconds:0});
 await engine.command({type:'play'});await engine.command({type:'volume',value:.8});
 const a=players[1];assert.equal(a.volume,.8);
 await engine.command({type:'select',track:{id:'b',url:'b'},fadeSeconds:2});
 tick(1000);assert.equal(a.volume,.4);assert.equal(players[2].volume,.4);
 tick(2000);assert.equal(a.paused,true);assert.equal(players[2].volume,.8);
 await engine.command({type:'seek',value:62});assert.equal(engine.snapshot().currentTime,62);
 await engine.command({type:'pause'});assert.equal(engine.snapshot().playing,false);
 await engine.command({type:'select',track:{id:'c',url:'c'},fadeSeconds:0});assert.equal(engine.snapshot().playing,false);
 await engine.command({type:'play'});await engine.command({type:'mute',value:true});assert.equal(engine.snapshot().muted,true);
 await engine.command({type:'stop'});assert.equal(engine.snapshot().currentTime,0);assert.equal(engine.snapshot().playing,false);
});

test('bundled songs seed once and deleted songs stay deleted after restarting',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'gallorin-music-seed-'));
 t.after(()=>rm(directory,{recursive:true,force:true}));
 const source=join(directory,'source.mp3');await import('node:fs/promises').then(fs=>fs.writeFile(source,mp3));
 const id='8bdd69a1-74ec-4b95-8b1e-98e535408e2b',seeds=[{id,name:'Bundled song',source}];
 const first=new MusicLibrary(directory,undefined,seeds);assert.equal((await first.read()).tracks.length,1);
 const second=new MusicLibrary(directory,undefined,seeds);assert.equal((await second.read()).tracks.length,1);
 await second.settings({assignments:{default:id,'main-menu':'menu'},fadeSeconds:2},['default','main-menu']);
 assert.equal(selectedMusic(await second.read(),'main-menu'),'menu');
 assert.equal(selectedMusic(await second.read(),'stable'),id);
 await second.remove(id);
 const third=new MusicLibrary(directory,undefined,seeds);
 assert.equal((await third.read()).tracks.length,0);
});

test('playlist inheritance prefers page, then section, then default and formats MP3 titles',()=>{
 const library={assignments:{default:['menu'],stable:['a','b'],'stable/all':['c','d']}};
 assert.deepEqual(selectedPlaylist(library,'stable/all'),['c','d']);
 assert.deepEqual(selectedPlaylist(library,'stable/breeding'),['a','b']);
 assert.deepEqual(selectedPlaylist(library,'wilds/aetherion'),['menu']);
 assert.equal(formatMusicName('aetherion-wilds.mp3'),'Aetherion Wilds');
 assert.equal(formatMusicName('cyberspace2.mp3'),'Cyberspace 2');
 assert.equal(formatMusicName('myTrack_name.mp3'),'My Track Name');
 assert.equal(formatMusicName('main-menu.mp3'),'Main Menu');
});
test('ordered playlists persist and deleting a song preserves the rest of each list',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'gallorin-playlists-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const store=new MusicLibrary(directory),one=await store.import('one.mp3',mp3),a=one.tracks[0].id;
 const two=await store.import('two.mp3',mp3),b=two.tracks[1].id;
 await store.settings({assignments:{'stable/all':[b,a,b],'main-menu':[a,b]},fadeSeconds:2},['stable/all','main-menu']);
 assert.deepEqual((await store.read()).assignments['stable/all'],[b,a]);
 assert.deepEqual((await new MusicLibrary(directory).read()).assignments['main-menu'],[a,b]);
 await store.remove(a);assert.deepEqual((await store.read()).assignments['main-menu'],[b]);
 await assert.rejects(store.settings({assignments:{default:[b,'missing']},fadeSeconds:2},['default']),/existing song/);
});
test('next, previous, automatic advance and repeated page renders retain queue position',async()=>{
 let players=[];const engine=createMusicEngine({audio:fakeAudio(),makeAudio:()=>{const a=fakeAudio();players.push(a);return a;},clock:()=>0,frame:()=>{}});
 const tracks=[{id:'a',url:'a'},{id:'b',url:'b'},{id:'c',url:'c'}];
 await engine.command({type:'playlist',key:'test',tracks,fadeSeconds:0});await engine.command({type:'play'});
 await engine.command({type:'next'});assert.equal(engine.snapshot().track.id,'b');
 await engine.command({type:'playlist',key:'test',tracks,fadeSeconds:0});assert.equal(engine.snapshot().track.id,'b');
 await engine.command({type:'previous'});assert.equal(engine.snapshot().track.id,'a');
 await engine.command({type:'previous'});assert.equal(engine.snapshot().track.id,'c');
 players.at(-1).onended();await Promise.resolve();await Promise.resolve();assert.equal(engine.snapshot().track.id,'a');
 await engine.command({type:'pause'});await engine.command({type:'next'});assert.equal(engine.snapshot().track.id,'b');assert.equal(engine.snapshot().playing,false);
});
