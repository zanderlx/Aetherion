import {escapeHTML as e,icon} from './ui.js';
import {musicContext,selectedMusic,musicContexts} from './music-context.js';
import {createMusicEngine} from './music-engine.js';

const builtin={id:'menu',name:'The Symphony of the Wilds'};
const time=value=>{const s=Math.max(0,Math.floor(value||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
export function createMusicPlayer({notify,getLocations}){
 let loading;
 let library={tracks:[],assignments:{},fadeSeconds:2},context='default',started=false,loaded=false,requestRevision=0,updating=false;
 const desktop=window.gallorinMusic;
 const engine=desktop?null:createMusicEngine();
 const transport=desktop||{state:async()=>engine.snapshot(),command:value=>engine.command(value)};
 let preferences={volume:35,muted:false};
 if(!desktop){try{const saved=JSON.parse(localStorage.getItem('gallorin-audio')||'null');if(saved&&Number.isFinite(saved.volume))preferences={volume:Math.max(0,Math.min(100,saved.volume)),muted:saved.muted===true};}catch{}}
 const bar=document.createElement('footer');bar.className='music-player';bar.setAttribute('aria-label','Music player');
 bar.innerHTML='<div class="music-now"><span class="music-art" aria-hidden="true">♫</span><div><strong data-song>Music</strong><small data-context>Gallorin</small></div></div><div class="music-transport"><div class="music-buttons"><button type="button" data-music="stop" title="Stop" aria-label="Stop music">■</button><button type="button" class="music-play" data-music="toggle" title="Play / Pause" aria-label="Play music">▶</button><button type="button" data-music="restart" title="Restart song" aria-label="Restart song">↺</button></div><div class="music-timeline"><span data-current>0:00</span><input type="range" data-seek min="0" max="0" step="0.1" value="0" aria-label="Song progress"><span data-duration>0:00</span></div></div><div class="music-volume"><button type="button" data-music="mute" title="Mute music" aria-label="Mute music">♫</button><input type="range" data-volume min="0" max="100" value="35" aria-label="Music volume"><output data-volume-value>35%</output><a href="#dev/music" title="Music settings" aria-label="Music settings">'+icon('settings')+'</a></div><span class="music-error" role="status"></span>';
 document.body.append(bar);document.body.classList.add('has-music-player');
 const q=selector=>bar.querySelector(selector);
 async function api(url,body){
  const response=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to update music.');return result;
 }
 async function setPreferences(value){
  preferences={...preferences,...value};
  if(desktop&&window.desktopMenu)await window.desktopMenu.setAudio(preferences);
  else{await transport.command({type:'volume',value:preferences.volume/100});await transport.command({type:'mute',value:preferences.muted});try{localStorage.setItem('gallorin-audio',JSON.stringify(preferences));}catch{}}
 }
 async function refreshLibrary(){if(!loading)loading=api('/api/music').then(value=>{library=value;loaded=true;return value;}).finally(()=>{loading=null;});return loading;}
 async function select(){
  if(!loaded)return;
  const id=selectedMusic(library,context),track=library.tracks.find(t=>t.id===id)||builtin;
  await transport.command({type:'select',track:{...track,url:location.origin+'/api/music/media/'+track.id},fadeSeconds:library.fadeSeconds});
  if(!desktop&&!started){started=true;await setPreferences(preferences);await transport.command({type:'play'});}
  await refresh();
 }
 async function refresh(){
  if(updating||document.hidden)return;updating=true;
  try{
   const state=await transport.state();if(!state)return;
   preferences={volume:state.volume,muted:state.muted};
   q('[data-song]').textContent=state.track?.name||builtin.name;
   q('[data-context]').textContent=musicContexts(getLocations()).find(v=>v.id===context)?.name||'Gallorin';
   const play=q('[data-music="toggle"]');play.textContent=state.playing?'Ⅱ':'▶';play.setAttribute('aria-label',state.playing?'Pause music':'Play music');
   const seek=q('[data-seek]');if(document.activeElement!==seek){seek.max=state.duration;seek.value=state.currentTime;}seek.disabled=!state.duration;
   q('[data-current]').textContent=time(state.currentTime);q('[data-duration]').textContent=time(state.duration);
   if(document.activeElement!==q('[data-volume]'))q('[data-volume]').value=state.volume;
   q('[data-volume-value]').textContent=state.volume+'%';
   const mute=q('[data-music="mute"]');mute.textContent=state.muted?'♪ ×':'♫';mute.setAttribute('aria-label',state.muted?'Unmute music':'Mute music');mute.setAttribute('aria-pressed',String(state.muted));
   q('.music-error').textContent=state.error||'';
  }catch{}finally{updating=false;}
 }
 bar.addEventListener('click',async event=>{
  const button=event.target.closest('[data-music]');if(!button)return;
  try{
   const state=await transport.state();
   if(button.dataset.music==='toggle')await transport.command({type:state.playing?'pause':'play'});
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
 function page(){
  const contexts=musicContexts(getLocations());
  const options=(selected)=>'<option value="">Use Default</option><option value="menu"'+(selected==='menu'?' selected':'')+'>The Symphony of the Wilds (built-in)</option>'+library.tracks.map(t=>'<option value="'+e(t.id)+'"'+(selected===t.id?' selected':'')+'>'+e(t.name)+'</option>').join('');
  return '<section class="music-manager"><header class="music-heading"><h1>Music</h1><label class="button primary music-import" role="button" tabindex="0">'+icon('plus')+' Import MP3s<input type="file" data-music-import accept=".mp3,audio/mpeg" multiple hidden></label></header><p class="music-help">Choose the music for each location. Songs loop and fade when you move between areas.</p><section class="panel music-assignments"><div class="music-section-heading"><h2>Location Music</h2><label class="music-fade">Crossfade <input type="number" data-fade min="0" max="10" step="0.5" value="'+library.fadeSeconds+'" aria-label="Crossfade seconds"> seconds</label></div><div class="music-location-grid">'+contexts.map(c=>'<label>'+e(c.name)+'<select data-music-location="'+e(c.id)+'" aria-label="'+e(c.name)+' music">'+(c.id==='default'?options(library.assignments[c.id]||'menu').replace('<option value="">Use Default</option>',''):options(library.assignments[c.id]))+'</select></label>').join('')+'</div><p class="music-help">Location choices save automatically. Fade: 0–10 seconds. Maximum file size: 50 MB per MP3.</p></section><section class="music-library"><h2>Your Music</h2><p class="music-help">Imported files are copied into your local game data folder.</p><div class="music-track-list">'+([builtin,...library.tracks].length?[builtin,...library.tracks].map(t=>'<article class="music-track"><span aria-hidden="true">♫</span><strong>'+e(t.name)+(t.id==='menu'?' <small>(built-in)</small>':'')+'</strong><button type="button" class="icon-button" data-preview-song="'+e(t.id)+'" aria-label="Preview '+e(t.name)+'" title="Preview song">▶</button><button type="button" class="icon-button" data-delete-song="'+e(t.id)+'" aria-label="Delete '+e(t.name)+'" title="Delete song"'+(t.id==='menu'?' hidden':'')+'>'+icon('trash')+'</button></article>').join(''):'<div class="panel music-empty">Import your MP3s to build a local music library. The built-in song is available now.</div>')+'</div></section></section>';
 }
 function bind(root){
  root.querySelector('.music-import')?.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();root.querySelector('[data-music-import]').click();}});
  root.querySelector('[data-music-import]')?.addEventListener('change',async event=>{
   const input=event.target,files=[...input.files];input.disabled=true;
   try{
    for(const file of files){
     if(!file.name.toLowerCase().endsWith('.mp3')||file.size>50*1024*1024)throw Error('Choose MP3 files up to 50 MB each.');
     const response=await fetch('/api/music/import',{method:'POST',headers:{'Content-Type':'audio/mpeg','X-File-Name':encodeURIComponent(file.name)},body:file});
     const result=await response.json();if(!response.ok)throw Error(result.error);library=result;
    }
    notify(files.length+' song'+(files.length===1?'':'s')+' imported.');
   }catch(error){notify(error.message,true);}
   finally{if(location.hash==='#dev/music'){root.innerHTML=page();bind(root);}}
  });
  root.querySelectorAll('[data-music-location],[data-fade]').forEach(field=>field.addEventListener('change',async()=>{
   const token=++requestRevision,assignments={};
   root.querySelectorAll('[data-music-location]').forEach(select=>{if(select.value)assignments[select.dataset.musicLocation]=select.value;});
   const fade=root.querySelector('[data-fade]'),fadeSeconds=fade.value.trim()===''?NaN:Number(fade.value);
   if(!Number.isFinite(fadeSeconds)||fadeSeconds<0||fadeSeconds>10){fade.value=library.fadeSeconds;notify('Crossfade must be between 0 and 10 seconds.',true);return;}
   try{const result=await api('/api/music/settings',{assignments,fadeSeconds});if(token===requestRevision){library=result;await select();notify('Music settings saved.');}}catch(error){notify(error.message,true);}
  }));
  root.querySelectorAll('[data-preview-song]').forEach(button=>button.addEventListener('click',async()=>{
   const track=[builtin,...library.tracks].find(t=>t.id===button.dataset.previewSong);
   await transport.command({type:'select',track:{...track,url:location.origin+'/api/music/media/'+track.id},fadeSeconds:library.fadeSeconds});
   await transport.command({type:'play'});await refresh();
  }));
  root.querySelectorAll('[data-delete-song]').forEach(button=>button.addEventListener('click',()=>{
   const track=library.tracks.find(t=>t.id===button.dataset.deleteSong),modal=document.createElement('dialog');modal.className='music-delete-dialog';
   modal.innerHTML='<h2>Delete Song?</h2><p></p><div><button type="button" data-no>Cancel</button><button type="button" class="button danger" data-yes>Delete</button></div>';
   modal.querySelector('p').textContent='Delete “'+track.name+'” from your music library? Locations using it will return to their default music.';
   document.body.append(modal);modal.addEventListener('close',()=>modal.remove());
   modal.querySelector('[data-no]').onclick=()=>modal.close();modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}});
   modal.querySelector('[data-yes]').onclick=async()=>{try{library=await api('/api/music/delete',{id:track.id});modal.close();await select();if(location.hash==='#dev/music'){root.innerHTML=page();bind(root);}}catch(error){notify(error.message,true);}};
   modal.showModal();
  }));
 }
 return {page,bind,async route(route){try{if(!loaded)await refreshLibrary();context=musicContext(route)||context;await select();}catch(error){notify(error.message,true);}}};
}
