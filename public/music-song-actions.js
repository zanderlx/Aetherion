import {bindPlaylistSelection} from './music-playlist-selection.js';
import {soundEffectGroups,isSoundEffect} from './music-effects.js';
import {musicGroups,musicTracks,playlistSongs,normalizePlaylistSelections} from './music-context.js';
import {escapeHTML as e,icon,groups as navigationGroups} from './ui.js';

export function bindSongActions(root,services,{signal,redraw}){
 let menu,menuAbort,edit,confirmation;
 const dialogs=new Set();
 const closeMenu=(focus=false)=>{
  menuAbort?.abort();if(menu?.anchor){menu.anchor.setAttribute('aria-expanded','false');if(focus&&menu.anchor.isConnected)menu.anchor.focus();}
  menu?.node.remove();menu=null;
 };
 const closeOutside=dialog=>{
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 };
 const modal=(className,title)=>{
  const dialog=document.createElement('dialog');dialog.className=className;dialog.setAttribute('aria-label',title);
  dialog.innerHTML='<header><h2>'+e(title)+'</h2><button type="button" class="music-dialog-close" aria-label="Close">×</button></header>';
  dialog.querySelector('.music-dialog-close').onclick=()=>dialog.close();
  document.body.append(dialog);dialogs.add(dialog);dialog.addEventListener('close',()=>dialogs.delete(dialog),{once:true});closeOutside(dialog);return dialog;
 };
 const restoreEdit=()=>{
  if(!edit)return;edit.orderCell.innerHTML=edit.oldOrder;edit.titleCell.innerHTML=edit.oldTitle;edit.artistCell.innerHTML=edit.oldArtist;edit.row.classList.remove('music-editing');edit.buttons.forEach(button=>button.disabled=false);edit=null;
 };
 const changed=()=>edit&&(edit.name.value.trim()!==edit.track.name||edit.artist.value.trim()!==edit.track.artist);
 const finishEdit=()=>{
  if(!edit||edit.saving||confirmation?.open)return;
  if(!changed()){restoreEdit();return;}
  const dialog=modal('music-edit-confirm music-song-dialog','Save Song Changes?');confirmation=dialog;
  const text=document.createElement('p');text.textContent='Save changes to this song, or discard them?';dialog.append(text);
  const error=document.createElement('p');error.className='music-song-error';error.setAttribute('role','alert');dialog.append(error);
  const actions=document.createElement('div');actions.className='music-dialog-actions';
  actions.innerHTML='<button type="button" class="button secondary" data-discard-song>Discard</button><button type="button" class="button primary" data-save-song>Save</button>';dialog.append(actions);
  actions.querySelector('[data-discard-song]').onclick=()=>{restoreEdit();dialog.close();};
  actions.querySelector('[data-save-song]').onclick=()=>saveEdit(error,dialog);
  dialog.addEventListener('close',()=>{confirmation=null;dialog.remove();if(edit?.row.isConnected&&!signal.aborted)edit.name.focus();},{once:true});dialog.showModal();
 };
 // Both explicit row saves and the close prompt persist the whole row together.
 const saveEdit=async(error,dialog)=>{
  if(!edit||edit.saving)return;
  const current=edit,values={name:edit.name.value.trim(),artist:edit.artist.value.trim()};
  if(!values.name||!values.artist){if(error)error.textContent='Enter a song name and artist, or discard the changes.';else services.notify('Enter a song name and artist.',true);return;}
  current.saving=true;current.row.querySelectorAll('input,button').forEach(el=>el.disabled=true);
  dialog?.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{if(changed())await services.updateSong(current.track.id,values);restoreEdit();dialog?.close();redraw();}
  catch(e){current.saving=false;current.row.querySelectorAll('input,[data-save-song-row]').forEach(el=>el.disabled=false);dialog?.querySelectorAll('button').forEach(b=>b.disabled=false);if(error)error.textContent=e.message;else services.notify(e.message,true);}
 };
 const editSong=id=>{
  if(edit){finishEdit();return;}
  const row=[...root.querySelectorAll('.music-library-table [data-music-track]')].find(row=>row.dataset.musicTrack===id);
  const track=musicTracks(services.getLibrary()).find(track=>track.id===id);if(!row||!track)return;
  const titleCell=row.cells[1],artistCell=row.cells[2],name=document.createElement('input'),artist=document.createElement('input');
  for(const [input,value,label,max] of [[name,track.name,'Song name',200],[artist,track.artist,'Artist',120]]){input.type='text';input.value=value;input.maxLength=max;input.required=true;input.setAttribute('aria-label',label);}
  name.dataset.songEditName='';artist.dataset.songEditArtist='';
  edit={row,track,titleCell,artistCell,name,artist,orderCell:row.cells[0],oldOrder:row.cells[0].innerHTML,oldTitle:titleCell.innerHTML,oldArtist:artistCell.innerHTML,buttons:[...row.querySelectorAll('button')]};
  edit.buttons.forEach(button=>button.disabled=true);
  edit.orderCell.innerHTML='<button type="button" class="music-row-save" data-save-song-row title="Save song" aria-label="Save song name and artist">'+icon('check')+'</button>';
  edit.orderCell.querySelector('button').onclick=()=>saveEdit();
  titleCell.replaceChildren(name);artistCell.replaceChildren(artist);row.classList.add('music-editing');name.focus();name.select();
  row.addEventListener('focusout',()=>setTimeout(()=>{if(edit?.row===row&&!row.contains(document.activeElement)&&!confirmation?.open)finishEdit();},0),{signal});
 };
 const addToPlaylists=id=>{
  const library=services.getLibrary(),track=musicTracks(library).find(t=>t.id===id);
  const effect=isSoundEffect(track);
  const dialog=modal('music-song-dialog music-playlist-picker',effect?'Add to Sound Events':'Add to Playlists');
  const subtitle=document.createElement('p');subtitle.textContent=track.name;dialog.append(subtitle);
  const controls=document.createElement('div');controls.className='music-picker-controls';
  const search=document.createElement('input');search.type='search';search.placeholder=effect?'Search events…':'Search playlists…';search.setAttribute('aria-label',effect?'Search sound events':'Search playlists');search.className='music-playlist-search';
  const section=document.createElement('select');section.setAttribute('aria-label','Filter by section');
  // General contains non-navigation destinations; the remaining sections follow the sidebar.
  const order=['General',...navigationGroups.map(group=>group.title)];
  const groups=(effect?structuredClone(soundEffectGroups):musicGroups(services.getLocations())).sort((a,b)=>order.indexOf(a.name)-order.indexOf(b.name));
  for(const group of groups){
   const navigation=navigationGroups.find(item=>item.title===group.name);
   if(effect)continue;
   const all=group.items[0],items=group.items.slice(1);
   items.sort((a,b)=>group.id==='stable'?navigation.items.findIndex(item=>item[0]===a.id)-navigation.items.findIndex(item=>item[0]===b.id):a.name.localeCompare(b.name));
   group.items=[all,...items];
  }
  section.innerHTML='<option value="">All Sections</option>'+groups.map(group=>'<option value="'+e(group.id)+'">'+e(group.name)+'</option>').join('');
  controls.append(search,section);dialog.append(controls);
  const tableBox=document.createElement('div');tableBox.className='music-picker-table';
  tableBox.innerHTML='<table><thead><tr><th scope="col">Section</th><th scope="col">'+(effect?'Sound Event':'Playlist')+'</th></tr></thead><tbody>'+groups.flatMap(group=>group.items.map(item=>'<tr data-playlist-section="'+e(group.id)+'" data-playlist-search="'+e((item.name+' '+group.name).toLowerCase())+'"><td><label><input type="checkbox" data-playlist-choice="'+e(item.id)+'" aria-label="'+e(group.name+' / '+item.name)+'"'+(playlistSongs(library,item.id).includes(id)?' checked':'')+'><span>'+e(group.name)+'</span></label></td><td>'+e(item.name)+'</td></tr>')).join('')+'</tbody></table>';
  dialog.append(tableBox);
  const refreshAvailability=bindPlaylistSelection(tableBox,groups);
  const empty=document.createElement('p');empty.className='music-search-empty';empty.textContent=effect?'No matching sound events.':'No matching playlists.';empty.hidden=true;dialog.append(empty);
  const filter=()=>{let visible=0;const term=search.value.trim().toLowerCase();tableBox.querySelectorAll('[data-playlist-search]').forEach(row=>{row.hidden=!row.dataset.playlistSearch.includes(term)||(section.value&&row.dataset.playlistSection!==section.value);if(!row.hidden)visible++;});empty.hidden=visible>0;};
  search.addEventListener('input',filter);section.addEventListener('change',filter);
  tableBox.addEventListener('click',event=>{if(event.target.closest('label')||event.target.matches('input'))return;const checkbox=event.target.closest('tr')?.querySelector('input');if(checkbox&&!checkbox.disabled){checkbox.checked=!checkbox.checked;refreshAvailability();}});
  const error=document.createElement('p');error.className='music-song-error';error.setAttribute('role','alert');dialog.append(error);
  const actions=document.createElement('div');actions.className='music-dialog-actions';actions.innerHTML='<button type="button" class="button secondary" data-cancel-playlists>Cancel</button><button type="button" class="button primary" data-save-playlists>Save</button>';dialog.append(actions);
  actions.querySelector('[data-cancel-playlists]').onclick=()=>dialog.close();
  actions.querySelector('[data-save-playlists]').onclick=async()=>{
   const selected=normalizePlaylistSelections([...dialog.querySelectorAll('[data-playlist-choice]:checked:not(:disabled)')].map(input=>input.dataset.playlistChoice),groups.flatMap(group=>group.items.map(item=>item.id)));
   dialog.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);
   try{await services.assignSong(id,selected);dialog.close();redraw();}
   catch(e){error.textContent=e.message;dialog.querySelectorAll('button,input,select').forEach(el=>el.disabled=false);refreshAvailability();}
  };
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();search.focus();
 };
 const deleteSong=id=>{
  const track=musicTracks(services.getLibrary()).find(track=>track.id===id);if(id==='menu')return;
  const dialog=document.createElement('dialog');dialog.className='music-delete-dialog';
  dialog.innerHTML='<h2>'+ (isSoundEffect(track)?'Delete Sound Effect?':'Delete Song?')+'</h2><p></p><div><button type="button" class="button secondary" data-no>Cancel</button><button type="button" class="button danger" data-yes>Delete</button></div>';
  dialog.querySelector('p').textContent='Delete “'+track.name+'” from the library and all '+(isSoundEffect(track)?'sound events':'playlists')+'?';
  document.body.append(dialog);dialogs.add(dialog);dialog.addEventListener('close',()=>dialogs.delete(dialog),{once:true});closeOutside(dialog);dialog.querySelector('[data-no]').onclick=()=>dialog.close();
  dialog.querySelector('[data-yes]').onclick=async()=>{
   dialog.querySelectorAll('button').forEach(b=>b.disabled=true);
   try{await services.deleteSong(id);dialog.close();redraw();}catch(e){services.notify(e.message,true);dialog.querySelectorAll('button').forEach(b=>b.disabled=false);}
  };
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
 };
 root.addEventListener('click',event=>{
  const anchor=event.target.closest('[data-song-options]');if(!anchor)return;
  if(menu?.anchor===anchor){closeMenu();return;}closeMenu();
  const id=anchor.dataset.songOptions,node=document.createElement('div');node.className='music-options-menu';node.setAttribute('role','menu');
  node.innerHTML='<button type="button" role="menuitem" data-song-option="add">Add</button><button type="button" role="menuitem" data-song-option="edit">Edit</button><button type="button" role="menuitem" data-song-option="delete"'+(id==='menu'?' disabled title="The default song is protected"':'')+'>Delete</button>';
  document.body.append(node);const rect=anchor.getBoundingClientRect(),size=node.getBoundingClientRect();
  node.style.left=Math.max(12,Math.min(rect.right-size.width,innerWidth-size.width-12))+'px';
  node.style.top=(rect.bottom+size.height+8<innerHeight?rect.bottom+6:Math.max(12,rect.top-size.height-6))+'px';
  menu={anchor,node};anchor.setAttribute('aria-expanded','true');menuAbort=new AbortController();
  window.addEventListener('resize',()=>closeMenu(),{signal:menuAbort.signal});
  window.addEventListener('scroll',()=>closeMenu(),{capture:true,signal:menuAbort.signal});
  node.addEventListener('click',event=>{const button=event.target.closest('[data-song-option]');if(!button||button.disabled)return;const action=button.dataset.songOption;closeMenu();if(action==='add')addToPlaylists(id);if(action==='edit')editSong(id);if(action==='delete')deleteSong(id);});
  document.addEventListener('click',event=>{if(menu&&!node.contains(event.target)&&!anchor.contains(event.target))closeMenu();},{capture:true,signal:menuAbort.signal});
  node.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeMenu(true);}if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();const buttons=[...node.querySelectorAll('button:not(:disabled)')],i=buttons.indexOf(document.activeElement);buttons[(i+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}});
  node.querySelector('button').focus();
 },{signal});
 document.addEventListener('click',event=>{
  if(!edit||confirmation?.open||edit.row.contains(event.target))return;
  if(!changed()){restoreEdit();return;}
  event.preventDefault();event.stopImmediatePropagation();finishEdit();
 },{capture:true,signal});
 document.addEventListener('keydown',event=>{
  if(edit&&!confirmation?.open&&!event.isComposing&&['Escape','Enter'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();if(event.key==='Enter')void saveEdit();else finishEdit();}
 },{capture:true,signal});
 document.addEventListener('gallorin-close-song-menu',()=>closeMenu(true),{signal});
 document.addEventListener('gallorin-finish-song-edit',finishEdit,{signal});
 signal.addEventListener('abort',()=>{closeMenu();restoreEdit();for(const dialog of dialogs){dialog.close();dialog.remove();}dialogs.clear();},{once:true});
}
