import {createAudioSettings} from './audio-settings.js';
import {audioPreferences as normalizeAudio} from './audio-preferences.js';
import {musicContext,selectedPlaylist,playlistSource,defaultMusicTrack} from './music-context.js';
import {musicManagerPage,bindMusicManager,updateMusicRows} from './music-manager.js';
import {createMusicEngine} from './music-engine.js';

const speakerIcon=muted=>'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(muted?'<path d="m3 3 18 18M9 5l3-2v6M12 15v6l-6-5H3V8h2"/>':'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>')+'</svg>';
const builtin=defaultMusicTrack;
const time=value=>{const s=Math.max(0,Math.floor(value||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
export function createMusicPlayer({notify,getLocations}){
 let loading,playback;
 let library={tracks:[],assignments:{},fadeSeconds:2},context='default',started=false,loaded=false,updating=false;
 const desktop=window.gallorinMusic;
 const engine=desktop?null:createMusicEngine();
 const transport=desktop||{state:async()=>engine.snapshot(),command:value=>engine.command(value)};
 let preferences=normalizeAudio();
 if(!desktop){try{const saved=JSON.parse(localStorage.getItem('gallorin-audio')||'null');if(saved&&Number.isFinite(saved.volume))preferences=normalizeAudio(saved);}catch{}}
 const bar=document.createElement('footer');bar.className='music-player';bar.setAttribute('aria-label','Music player');
 bar.innerHTML='<div class="music-now"><span class="music-art" aria-hidden="true">♫</span><div><strong data-song>Music</strong><small data-context>Gallorin Studios</small></div></div><div class="music-transport"><div class="music-buttons"><button type="button" data-music="stop" title="Stop" aria-label="Stop music">■</button><button type="button" data-music="previous" title="Previous song" aria-label="Previous song">⏮</button><button type="button" class="music-play" data-music="toggle" title="Play / Pause" aria-label="Play music">▶</button><button type="button" data-music="next" title="Next song" aria-label="Next song">⏭</button><button type="button" data-music="restart" title="Restart song" aria-label="Restart song">↺</button></div><div class="music-timeline"><span data-current>0:00</span><input type="range" data-seek min="0" max="0" step="0.1" value="0" aria-label="Song progress"><span data-duration>0:00</span></div></div><div class="music-volume"><button type="button" data-music="mute" title="Mute music" aria-label="Mute music">'+speakerIcon(false)+'</button><input type="range" data-volume min="0" max="100" value="35" aria-label="Music volume"><output data-volume-value>35%</output></div><span class="music-error" role="status"></span>';
 document.body.append(bar);document.body.classList.add('has-music-player');
 const q=selector=>bar.querySelector(selector);
 async function api(url,body){
  const response=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to update music.');return result;
 }
 async function setPreferences(value){
  preferences=normalizeAudio(value,preferences);
  if(desktop&&window.desktopMenu)await window.desktopMenu.setAudio(preferences);
  else{await transport.command({type:'volume',value:preferences.volume/100});await transport.command({type:'mute',value:preferences.muted});await transport.command({type:'sfx-volume',value:preferences.soundEffectsVolume/100});try{localStorage.setItem('gallorin-audio',JSON.stringify(preferences));}catch{}}
 }
 const audioSettings=createAudioSettings({
  getState:()=>desktop?window.desktopMenu.audio():Promise.resolve(preferences),
  saveState:async value=>{await setPreferences(value);return preferences;},
  getMusic:()=>desktop?window.desktopMenu.musicSettings():api('/api/music'),
  saveFade:async value=>{library=desktop?await window.desktopMenu.setCrossfade(value):await api('/api/music/fade',{fadeSeconds:value});await select();},
  notify
 });
 document.addEventListener('gallorin-audio-settings',()=>void audioSettings.open());
 async function refreshLibrary(){if(!loading)loading=api('/api/music').then(value=>{library=value;loaded=true;return value;}).finally(()=>{loading=null;});return loading;}
 async function select(){
  if(!loaded)return;
  const tracks=selectedPlaylist(library,context).map(id=>{const track=library.tracks.find(t=>t.id===id)||builtin;return {...track,url:location.origin+'/api/music/media/'+track.id};});
  await transport.command({type:'playlist',key:playlistSource(library,context),tracks,fadeSeconds:library.fadeSeconds});
  if(!desktop&&!started){started=true;await setPreferences(preferences);await transport.command({type:'play'});}
  await refresh();
 }
 async function refresh(){
  if(updating||document.hidden)return;updating=true;
  try{
   const state=await transport.state();if(!state)return;playback=state;updateMusicRows(document.querySelector('.music-manager'),state);
   preferences={...preferences,volume:state.volume,muted:state.muted,soundEffectsVolume:state.soundEffectsVolume??preferences.soundEffectsVolume};
   q('[data-song]').textContent=state.track?.name||(state.playlist?.length===0?'No Music':builtin.name);q('[data-song]').title=q('[data-song]').textContent;
   q('[data-context]').textContent='Gallorin Studios';
   for(const direction of ['previous','next'])q('[data-music="'+direction+'"]').disabled=(state.playlist?.length||1)<2;
   const play=q('[data-music="toggle"]');play.disabled=state.playlist?.length===0;play.textContent=state.playing?'Ⅱ':'▶';play.setAttribute('aria-label',state.playing?'Pause music':'Play music');
   const seek=q('[data-seek]');if(document.activeElement!==seek){seek.max=state.duration;seek.value=state.currentTime;}seek.disabled=!state.duration;
   q('[data-current]').textContent=time(state.currentTime);q('[data-duration]').textContent=time(state.duration);
   if(document.activeElement!==q('[data-volume]'))q('[data-volume]').value=state.volume;
   q('[data-volume-value]').textContent=state.volume+'%';
   const mute=q('[data-music="mute"]');mute.innerHTML=speakerIcon(state.muted);mute.setAttribute('aria-label',state.muted?'Unmute music':'Mute music');mute.setAttribute('aria-pressed',String(state.muted));
   q('.music-error').textContent=state.error||'';
  }catch{}finally{updating=false;}
 }
 bar.addEventListener('click',async event=>{
  const button=event.target.closest('[data-music]');if(!button)return;
  try{
   const state=await transport.state();
   if(button.dataset.music==='toggle')await transport.command({type:state.playing?'pause':'play'});
   if(['next','previous'].includes(button.dataset.music))await transport.command({type:button.dataset.music});
   if(button.dataset.music==='stop')await transport.command({type:'stop'});
   if(button.dataset.music==='restart'){await transport.command({type:'seek',value:0});await transport.command({type:'play'});}
   if(button.dataset.music==='mute')await setPreferences({muted:!state.muted});
   await refresh();
  }catch(error){notify(error.message,true);}
 });
 q('[data-seek]').addEventListener('input',()=>{q('[data-current]').textContent=time(Number(q('[data-seek]').value));});
 q('[data-seek]').addEventListener('change',()=>{void transport.command({type:'seek',value:Number(q('[data-seek]').value)});});
 q('[data-volume]').addEventListener('input',()=>{const volume=Number(q('[data-volume]').value);q('[data-volume-value]').textContent=volume+'%';void setPreferences({volume});});
 if(!desktop)void setPreferences(preferences);
 setInterval(()=>void refresh(),350);
 function page(){return musicManagerPage(library,getLocations());}
 function bind(root){
  bindMusicManager(root,{
   getLibrary:()=>library,getPlaybackState:()=>playback,getLocations,notify,openAudioSettings:()=>audioSettings.open(),
   async saveSettings(assignments,fadeSeconds){library=await api('/api/music/settings',{assignments,fadeSeconds});context=musicContext(location.hash.slice(1),library)||context;await select();},
   async importFiles(files){
    for(const file of files){
     if(!file.name.toLowerCase().endsWith('.mp3')||file.size>50*1024*1024)throw Error('Choose MP3 files up to 50 MB each.');
     const response=await fetch('/api/music/import',{method:'POST',headers:{'Content-Type':'audio/mpeg','X-File-Name':encodeURIComponent(file.name)},body:file});
     const result=await response.json();if(!response.ok)throw Error(result.error);library=result;
    }
    notify(files.length+' song'+(files.length===1?'':'s')+' imported.');
   },
   async preview(id,playlistContext){
    const ids=playlistContext?selectedPlaylist(library,playlistContext):[builtin,...library.tracks].map(t=>t.id);
    const tracks=ids.map(songId=>{const track=[builtin,...library.tracks].find(t=>t.id===songId);return {...track,url:location.origin+'/api/music/media/'+track.id};});
    if(playlistContext)context=playlistContext;
    await transport.command({type:'playlist',key:playlistContext||'library',startId:id,tracks,fadeSeconds:library.fadeSeconds});
    await transport.command({type:'play'});await refresh();
   },
   async deleteSong(id){library=await api('/api/music/delete',{id});await select();}
  });
 }
 return {page,bind,async route(route){try{if(!loaded)await refreshLibrary();context=musicContext(route,library)||context;await select();}catch(error){notify(error.message,true);}}};
}
