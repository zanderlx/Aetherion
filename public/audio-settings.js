import {audioPreferences} from './audio-preferences.js';
export function createAudioSettings({id='desktop-audio',getState,saveState,getMusic,saveFade,notify=()=>{}}){
 const dialog=document.createElement('dialog');dialog.id=id;dialog.className='audio-settings-dialog';dialog.setAttribute('aria-labelledby',id+'-title');
 dialog.innerHTML='<header><h2 id="'+id+'-title">Audio Settings</h2><button type="button" class="audio-settings-close" aria-label="Close audio settings">×</button></header><div class="audio-settings-rows"><label><span>Music</span><input id="'+(id==='audio-settings'?'volume':'game-music-volume')+'" data-audio-pref="volume" type="range" min="0" max="100" value="35" aria-label="Music"><output data-value="volume">35%</output></label><label><span>Sound Effects</span><input data-audio-pref="soundEffectsVolume" type="range" min="0" max="100" value="100" aria-label="Sound Effects"><output data-value="soundEffectsVolume">100%</output></label><label><span>Crossfade</span><input data-audio-fade type="number" min="0" max="10" step="0.5" value="2" aria-label="Crossfade seconds"><span class="audio-fade-unit">seconds</span></label></div><p class="audio-settings-error" role="status"></p>';
 document.body.append(dialog);
 let state=audioPreferences(),fade=2,revision=0;
 const error=message=>{dialog.querySelector('.audio-settings-error').textContent=message;notify(message,true);};
 const display=()=>{
  for(const key of ['volume','soundEffectsVolume']){dialog.querySelector('[data-audio-pref="'+key+'"]').value=state[key];dialog.querySelector('[data-value="'+key+'"]').textContent=state[key]+'%';}
  dialog.querySelector('[data-audio-fade]').value=fade;
 };
 dialog.querySelector('.audio-settings-close').onclick=()=>dialog.close();
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.querySelectorAll('[data-audio-pref]').forEach(input=>input.addEventListener('input',async()=>{
  const key=input.dataset.audioPref,token=++revision;state={...state,[key]:Number(input.value)};dialog.querySelector('[data-value="'+key+'"]').textContent=input.value+'%';
  try{const saved=await saveState(state);if(token===revision)state=audioPreferences(saved,state);}catch(e){error(e.message);}
 }));
 dialog.querySelector('[data-audio-fade]').addEventListener('change',async event=>{
  const input=event.target,value=input.value.trim()===''?NaN:Number(input.value);
  if(!Number.isFinite(value)||value<0||value>10){input.value=fade;error('Crossfade must be between 0 and 10 seconds.');return;}
  if(value===fade)return;
  input.disabled=true;
  try{await saveFade(value);fade=value;dialog.querySelector('.audio-settings-error').textContent='';}catch(e){input.value=fade;error(e.message);}finally{input.disabled=false;}
 });
 return {dialog,async open(){
  try{const [saved,music]=await Promise.all([getState(),getMusic()]);state=audioPreferences(saved);fade=music.fadeSeconds;display();dialog.querySelector('.audio-settings-error').textContent='';if(!dialog.open)dialog.showModal();}
  catch(e){notify(e.message,true);}
 }};
}
