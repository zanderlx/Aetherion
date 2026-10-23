const music=document.querySelector('#music'),mute=document.querySelector('#mute'),volume=document.querySelector('#volume'),value=document.querySelector('#volume-value'),settings=document.querySelector('#audio-settings');
let preferences={volume:50,muted:false};
try{const saved=JSON.parse(localStorage.getItem('aetherion-audio'));if(saved&&Number.isFinite(saved.volume))preferences={volume:Math.max(0,Math.min(100,saved.volume)),muted:saved.muted===true};}catch{}
function apply(){music.volume=preferences.volume/100;music.muted=preferences.muted;volume.value=preferences.volume;value.textContent=preferences.volume+'%';mute.textContent=preferences.muted?'♫ Music Off':'♫ Music On';mute.setAttribute('aria-label',preferences.muted?'Unmute music':'Mute music');mute.title=preferences.muted?'Unmute music':'Mute music';try{localStorage.setItem('aetherion-audio',JSON.stringify(preferences));}catch{}}
apply();
const resume=()=>music.play().catch(()=>{});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)resume();});if(!document.hidden)resume();document.addEventListener('pointerdown',resume,{once:true});
mute.addEventListener('click',()=>{preferences.muted=!preferences.muted;apply();});
volume.addEventListener('input',()=>{preferences.volume=Number(volume.value);apply();});
document.querySelector('#settings').addEventListener('click',()=>settings.showModal());
settings.addEventListener('click',event=>{if(event.target===settings){const r=settings.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)settings.close();}});
document.querySelector('#play').addEventListener('click',()=>{music.pause();location.href=new URLSearchParams(location.search).get('game');});
document.querySelector('#exit').addEventListener('click',()=>window.desktopMenu.exit());

window.desktopMenu.version().then(version=>{if(version)document.querySelector('#version').textContent='AETHERION V'+version;});
