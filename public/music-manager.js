import {bindMusicSorting} from './music-table-sort.js';
import {bindMusicDisclosures} from './music-disclosures.js';
import {escapeHTML as e,icon} from './ui.js';
import {musicGroups,defaultMusicTrack,playlistSongs,formatMusicDuration} from './music-context.js';

const bindings=new WeakMap();
const allTracks=library=>[defaultMusicTrack,...library.tracks];
const chevron='<span class="music-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>';
const rowPlay=(track,index,context='')=>'<td class="music-order"><span class="music-index-control"><span class="music-row-number">'+(index+1)+'</span><button type="button" class="music-row-play" data-preview-song="'+e(track.id)+'"'+(context?' data-playlist-context="'+e(context)+'"':'')+' title="Play song" aria-label="Play '+e(track.name)+'">▶</button></span></td>';
function songRows(library,context){
 const ids=playlistSongs(library,context);
 if(!ids.length)return '<tr><td colspan="5" class="music-empty-playlist">No songs in this playlist. Using default song.</td></tr>';
 return ids.map((id,index)=>{
  const track=allTracks(library).find(t=>t.id===id);if(!track)return '';
  return '<tr data-music-track="'+e(id)+'">'+rowPlay(track,index,context)+'<td><strong>'+e(track.name)+'</strong></td><td class="music-artist">Gallorin Studios</td><td class="music-duration">'+formatMusicDuration(track.durationSeconds)+'</td><td class="music-row-actions"><button type="button" class="music-row-trash" data-playlist-remove="'+e(context)+'" data-index="'+index+'" title="Remove from playlist" aria-label="Remove '+e(track.name)+' from playlist">'+icon('trash')+'</button></td></tr>';
 }).join('');
}
function playlistCard(library,item){
 const count=playlistSongs(library,item.id).length;
 return '<details class="music-playlist" data-playlist="'+e(item.id)+'" open><summary><h3>'+e(item.name)+'</h3><span class="music-playlist-count">'+count+' song'+(count===1?'':'s')+'</span>'+chevron+'</summary><div class="music-playlist-body"><div class="music-table-scroll"><table class="music-table"><thead><tr><th scope="col" class="music-order">#</th><th scope="col">Title</th><th scope="col" class="music-artist">Artist</th><th scope="col" class="music-duration">Duration</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>'+songRows(library,item.id)+'</tbody></table></div></div></details>';
}
export function updateMusicRows(root,state){
 if(!root)return;
 for(const row of root.querySelectorAll('[data-music-track]')){
  const current=!!state?.track?.id&&row.dataset.musicTrack===state.track.id;
  if(row.classList.contains('is-current')!==current){
   row.classList.toggle('is-current',current);
   if(current)row.setAttribute('aria-current','true');else row.removeAttribute('aria-current');
  }
 }
}
export function musicManagerPage(library,locations){
 return '<section class="music-manager"><header class="music-heading"><h1>Music</h1><button type="button" class="button music-header-toggle" data-music-toggle-all>Show All</button><button type="button" class="button music-audio-settings" data-audio-settings>'+icon('settings')+' Audio Settings</button></header><div class="music-playlist-groups">'+musicGroups(locations).map(group=>'<details class="music-group" data-music-group="'+e(group.id)+'"'+(group.id==='general'?' open':'')+'><summary><h2>'+e(group.name)+'</h2><button type="button" class="music-scope-toggle" data-music-toggle-folder>Show All</button><span class="music-group-count">'+group.items.length+' playlist'+(group.items.length===1?'':'s')+'</span>'+chevron+'</summary><div class="music-group-playlists">'+group.items.map(item=>playlistCard(library,item)).join('')+'</div></details>').join('')+'</div><section class="music-library"><header class="music-all-heading"><h2>All Songs</h2><label class="button primary music-import" role="button" tabindex="0">'+icon('music')+' Import Music<input type="file" data-music-import accept=".mp3,audio/mpeg" multiple hidden></label></header><div class="music-table-scroll"><table class="music-table music-library-table"><thead><tr><th scope="col" class="music-order">#</th><th scope="col">Title</th><th scope="col" class="music-artist">Artist</th><th scope="col" class="music-duration">Duration</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>'+allTracks(library).map((t,index)=>'<tr data-music-track="'+e(t.id)+'">'+rowPlay(t,index)+'<td><strong>'+e(t.name)+'</strong></td><td class="music-artist">Gallorin Studios</td><td class="music-duration">'+formatMusicDuration(t.durationSeconds)+'</td><td class="music-row-actions">'+(t.id==='menu'?'':'<button type="button" class="music-row-trash" data-delete-song="'+e(t.id)+'" title="Delete song" aria-label="Delete '+e(t.name)+'">'+icon('trash')+'</button>')+'</td></tr>').join('')+'</tbody></table></div></section></section>';
}
export function bindMusicManager(root,services){
 bindings.get(root)?.abort();const controller=new AbortController();bindings.set(root,controller);const options={signal:controller.signal};
 bindMusicDisclosures(root,controller.signal);
 bindMusicSorting(root,controller.signal);
 updateMusicRows(root,services.getPlaybackState?.());
 let busy=false;
 const redraw=()=>{
  if(location.hash!=='#dev/music')return;
  const opened=new Set([...root.querySelectorAll('[data-music-group],[data-playlist]')].filter(d=>d.dataset.expanding?d.dataset.expanding==='true':d.open).map(d=>d.dataset.musicGroup||d.dataset.playlist));
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

 },options);
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled)return;
  if(button.dataset.previewSong)void services.preview(button.dataset.previewSong,button.dataset.playlistContext).catch(error=>services.notify(error.message,true));
  if(button.hasAttribute('data-audio-settings'))void services.openAudioSettings();
  if(button.dataset.playlistRemove)void run(()=>save(button.dataset.playlistRemove,playlistSongs(services.getLibrary(),button.dataset.playlistRemove).filter((_,i)=>i!==Number(button.dataset.index))));
  if(button.dataset.deleteSong){
   const track=services.getLibrary().tracks.find(t=>t.id===button.dataset.deleteSong),modal=document.createElement('dialog');modal.className='music-delete-dialog';
   modal.innerHTML='<h2>Delete Song?</h2><p></p><div><button type="button" data-no>Cancel</button><button type="button" class="button danger" data-yes>Delete</button></div>';
   modal.querySelector('p').textContent='Delete “'+track.name+'” from your music library and all playlists?';
   document.body.append(modal);modal.addEventListener('close',()=>modal.remove());modal.querySelector('[data-no]').onclick=()=>modal.close();
   modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}});
   modal.querySelector('[data-yes]').onclick=()=>{modal.close();void run(()=>services.deleteSong(track.id));};modal.showModal();
  }
 },options);
 root.addEventListener('dblclick',event=>{
  if(event.target.closest('button,a,input,select'))return;
  const row=event.target.closest('[data-music-track]'),button=row?.querySelector('[data-preview-song]');
  if(button)void services.preview(button.dataset.previewSong,button.dataset.playlistContext).catch(error=>services.notify(error.message,true));
 },options);

}
