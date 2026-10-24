import {escapeHTML as e,icon} from './ui.js';
import {musicGroups,defaultMusicTrack,assignmentTracks,selectedPlaylist,formatMusicDuration} from './music-context.js';

const bindings=new WeakMap();
const allTracks=library=>[defaultMusicTrack,...library.tracks];
const chevron='<span class="music-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>';
function songRows(library,context){
 const ids=selectedPlaylist(library,context);
 if(!ids.length)return '<tr><td colspan="5" class="music-empty-playlist">No songs in this playlist.</td></tr>';
 return ids.map((id,index)=>{
  const track=allTracks(library).find(t=>t.id===id);if(!track)return '';
  const removeLabel=id==='menu'?'Remove from playlist':'Remove song from this playlist';
  return '<tr><td class="music-order">'+(index+1)+'</td><td><strong>'+e(track.name)+'</strong>'+(id==='menu'?' <small>(default)</small>':'')+'</td><td class="music-artist">Gallorin Studios</td><td class="music-duration">'+formatMusicDuration(track.durationSeconds)+'</td><td class="music-row-actions"><button type="button" data-preview-song="'+e(id)+'" title="Play song" aria-label="Play '+e(track.name)+'">▶</button><button type="button" data-playlist-move="'+e(context)+'" data-index="'+index+'" data-direction="-1" title="Move up" aria-label="Move '+e(track.name)+' up"'+(index===0?' disabled':'')+'>↑</button><button type="button" data-playlist-move="'+e(context)+'" data-index="'+index+'" data-direction="1" title="Move down" aria-label="Move '+e(track.name)+' down"'+(index===ids.length-1?' disabled':'')+'>↓</button><button type="button" data-playlist-remove="'+e(context)+'" data-index="'+index+'" title="'+removeLabel+'" aria-label="'+removeLabel+': '+e(track.name)+'">'+icon(id==='menu'?'close':'trash')+'</button></td></tr>';
 }).join('');
}
function playlistCard(library,item){
 const own=assignmentTracks(library.assignments[item.id]),count=selectedPlaylist(library,item.id).length;
 const choices=allTracks(library).filter(t=>!own.includes(t.id));
 return '<details class="music-playlist" data-playlist="'+e(item.id)+'" open><summary><div><h3>'+e(item.name)+'</h3><small>'+count+' song'+(count===1?'':'s')+'</small></div>'+chevron+'</summary><div class="music-playlist-body"><div class="music-playlist-controls">'+(Object.hasOwn(library.assignments,item.id)?'<button type="button" class="music-text-button" data-playlist-reset="'+e(item.id)+'">'+(item.id==='default'?'Reset':'Use Default')+'</button>':'')+'<select data-playlist-add="'+e(item.id)+'" data-music-location="'+e(item.id)+'" aria-label="Add music to '+e(item.name)+'"><option value="">Add Music…</option>'+choices.map(t=>'<option value="'+e(t.id)+'">'+e(t.name)+(t.id==='menu'?' (default)':'')+'</option>').join('')+'</select></div><div class="music-table-scroll"><table class="music-table"><thead><tr><th scope="col">#</th><th scope="col">Title</th><th scope="col" class="music-artist">Artist</th><th scope="col" class="music-duration">Duration</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>'+songRows(library,item.id)+'</tbody></table></div></div></details>';
}
export function musicManagerPage(library,locations){
 return '<section class="music-manager"><header class="music-heading"><h1>Music</h1><label class="button primary music-import" role="button" tabindex="0">'+icon('plus')+' Import Music<input type="file" data-music-import accept=".mp3,audio/mpeg" multiple hidden></label><button type="button" class="button music-audio-settings" data-audio-settings>'+icon('settings')+' Audio Settings</button></header><section class="music-section-heading music-playlists-heading"><h2>Location Music</h2></section><div class="music-playlist-groups">'+musicGroups(locations).map(group=>'<details class="music-group" data-music-group="'+e(group.id)+'"'+(group.id==='general'?' open':'')+'><summary><h2>'+e(group.name)+'</h2><span class="music-group-count">'+group.items.length+' playlist'+(group.items.length===1?'':'s')+'</span>'+chevron+'</summary><div class="music-group-playlists">'+group.items.map(item=>playlistCard(library,item)).join('')+'</div></details>').join('')+'</div><section class="music-library"><h2>Your Music</h2><div class="music-table-scroll"><table class="music-table music-library-table"><thead><tr><th scope="col">Title</th><th scope="col" class="music-artist">Artist</th><th scope="col" class="music-duration">Duration</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>'+allTracks(library).map(t=>'<tr><td><strong>'+e(t.name)+'</strong>'+(t.id==='menu'?' <small>(default)</small>':'')+'</td><td class="music-artist">Gallorin Studios</td><td class="music-duration">'+formatMusicDuration(t.durationSeconds)+'</td><td class="music-row-actions"><button type="button" data-preview-song="'+e(t.id)+'" title="Play song" aria-label="Play '+e(t.name)+'">▶</button>'+(t.id==='menu'?'':'<button type="button" data-delete-song="'+e(t.id)+'" title="Delete song" aria-label="Delete '+e(t.name)+'">'+icon('trash')+'</button>')+'</td></tr>').join('')+'</tbody></table></div></section></section>';
}
export function bindMusicManager(root,services){
 bindings.get(root)?.abort();const controller=new AbortController();bindings.set(root,controller);const options={signal:controller.signal};
 let busy=false;
 const redraw=()=>{
  if(location.hash!=='#dev/music')return;
  const opened=new Set([...root.querySelectorAll('[data-music-group][open],[data-playlist][open]')].map(d=>d.dataset.musicGroup||d.dataset.playlist));
  root.innerHTML=musicManagerPage(services.getLibrary(),services.getLocations());
  root.querySelectorAll('[data-music-group],[data-playlist]').forEach(d=>d.open=opened.has(d.dataset.musicGroup||d.dataset.playlist));
  bindMusicManager(root,services);
 };
 const run=async fn=>{
  if(busy)return;busy=true;root.setAttribute('aria-busy','true');
  root.querySelectorAll('button,select,input').forEach(el=>el.disabled=true);
  try{await fn();redraw();}catch(error){services.notify(error.message,true);redraw();}
  finally{busy=false;root.removeAttribute('aria-busy');}
 };
 const save=async(context,ids)=>{
  const library=services.getLibrary(),assignments={...library.assignments};
  if(ids===null)delete assignments[context];else assignments[context]=ids;
  await services.saveSettings(assignments,library.fadeSeconds);
 };
 root.addEventListener('keydown',event=>{
  if(event.target.closest('.music-import')&&(event.key==='Enter'||event.key===' ')){event.preventDefault();root.querySelector('[data-music-import]').click();}
 },options);
 root.addEventListener('change',event=>{
  const target=event.target;
  if(target.matches('[data-music-import]'))void run(()=>services.importFiles([...target.files]));
  if(target.matches('[data-playlist-add]')&&target.value)void run(()=>save(target.dataset.playlistAdd,[...assignmentTracks(services.getLibrary().assignments[target.dataset.playlistAdd]),target.value]));
 },options);
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled)return;
  if(button.dataset.previewSong)void services.preview(button.dataset.previewSong).catch(error=>services.notify(error.message,true));
  if(button.hasAttribute('data-audio-settings'))void services.openAudioSettings();
  if(button.dataset.playlistReset)void run(()=>save(button.dataset.playlistReset,null));
  if(button.dataset.playlistRemove)void run(()=>save(button.dataset.playlistRemove,selectedPlaylist(services.getLibrary(),button.dataset.playlistRemove).filter((_,i)=>i!==Number(button.dataset.index))));
  if(button.dataset.playlistMove)void run(()=>{
   const ids=[...selectedPlaylist(services.getLibrary(),button.dataset.playlistMove)],from=Number(button.dataset.index),to=from+Number(button.dataset.direction);
   if(to<0||to>=ids.length)return;
   [ids[from],ids[to]]=[ids[to],ids[from]];return save(button.dataset.playlistMove,ids);
  });
  if(button.dataset.deleteSong){
   const track=services.getLibrary().tracks.find(t=>t.id===button.dataset.deleteSong),modal=document.createElement('dialog');modal.className='music-delete-dialog';
   modal.innerHTML='<h2>Delete Song?</h2><p></p><div><button type="button" data-no>Cancel</button><button type="button" class="button danger" data-yes>Delete</button></div>';
   modal.querySelector('p').textContent='Delete “'+track.name+'” from your music library and all playlists?';
   document.body.append(modal);modal.addEventListener('close',()=>modal.remove());modal.querySelector('[data-no]').onclick=()=>modal.close();
   modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}});
   modal.querySelector('[data-yes]').onclick=()=>{modal.close();void run(()=>services.deleteSong(track.id));};modal.showModal();
  }
 },options);
}
