import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {audioPreferences} from '../public/audio-preferences.js';
import {createMusicEngine} from '../public/music-engine.js';
import {MusicLibrary} from '../src/music-library.js';
import {selectedPlaylist,defaultMusicTrack} from '../public/music-context.js';
const fake=()=>({volume:1,muted:false,paused:true,currentTime:0,duration:180,async play(){this.paused=false;},pause(){this.paused=true;},removeAttribute(){},load(){}});
test('audio preferences migrate and keep music and effect levels independent',()=>{
 assert.deepEqual(audioPreferences(),{volume:35,muted:false,soundEffectsVolume:100});
 const saved=audioPreferences({volume:45,muted:true,soundEffectsVolume:70});
 assert.deepEqual(audioPreferences({volume:20},saved),{volume:20,muted:true,soundEffectsVolume:70});
 assert.equal(audioPreferences({soundEffectsVolume:250}).soundEffectsVolume,100);
 assert.equal(audioPreferences({soundEffectsVolume:-2}).soundEffectsVolume,0);
});
test('sound effects use their own live volume without changing music',async()=>{
 const players=[],engine=createMusicEngine({audio:fake(),makeAudio:()=>{const a=fake();players.push(a);return a;},frame:()=>{},clock:()=>0});
 await engine.command({type:'select',track:{id:'song',url:'song'},fadeSeconds:0});await engine.command({type:'volume',value:.4});
 await engine.command({type:'sfx-volume',value:.75});await engine.command({type:'effect',track:{url:'effect'}});
 assert.equal(players[0].volume,.4);assert.equal(players[1].volume,.75);
 await engine.command({type:'sfx-volume',value:.2});assert.equal(players[1].volume,.2);assert.equal(players[0].volume,.4);
});
test('empty playlists remain silent and preserve earlier playback intent',async()=>{
 const engine=createMusicEngine({audio:fake(),makeAudio:fake,frame:()=>{},clock:()=>0});
 await engine.command({type:'playlist',tracks:[{id:'a',url:'a'}],key:'one',fadeSeconds:0});await engine.command({type:'play'});
 await engine.command({type:'playlist',tracks:[],key:'empty'});assert.equal(engine.snapshot().track,null);assert.equal(engine.snapshot().playing,false);
 assert.deepEqual(selectedPlaylist({assignments:{'stable/all':[]}},'stable/all'),[]);
 await engine.command({type:'playlist',tracks:[{id:'b',url:'b'}],key:'two',fadeSeconds:0});assert.equal(engine.snapshot().playing,true);
});
test('MP3 duration metadata is parsed and stored during import',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'gallorin-duration-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const bytes=await readFile(new URL('../desktop/assets/music/universfield-magic-twinkle-244951.mp3',import.meta.url));
 const result=await new MusicLibrary(dir).import('twinkle.mp3',bytes);
 assert.ok(result.tracks[0].durationSeconds>2&&result.tracks[0].durationSeconds<4);
 const persisted=await new MusicLibrary(dir).read();assert.equal(persisted.tracks[0].durationSeconds,result.tracks[0].durationSeconds);
 assert.ok(defaultMusicTrack.durationSeconds>178&&defaultMusicTrack.durationSeconds<179);
});
