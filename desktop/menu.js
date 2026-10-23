const mute=document.querySelector('#mute'),volume=document.querySelector('#volume'),value=document.querySelector('#volume-value'),settings=document.querySelector('#audio-settings');
let preferences=await window.desktopMenu.audio();
const audioMuted=document.querySelector('#audio-muted');
function display(){audioMuted.checked=preferences.muted;volume.value=preferences.volume;value.textContent=preferences.volume+'%';mute.textContent=preferences.muted?'♫ Music Off':'♫ Music On';mute.title=preferences.muted?'Unmute music':'Mute music';}
display();
mute.onclick=async()=>{preferences=await window.desktopMenu.setAudio({...preferences,muted:!preferences.muted});display();};
volume.oninput=()=>{preferences.volume=Number(volume.value);display();window.desktopMenu.setAudio({...preferences});};
document.querySelector('#settings').onclick=()=>settings.showModal();
document.querySelector('#play').onclick=()=>{location.href=new URLSearchParams(location.search).get('game');};
document.querySelector('#exit').onclick=()=>window.desktopMenu.exit();
window.desktopMenu.version().then(version=>{if(version)document.querySelector('#version').textContent='AETHERION V'+version;});

audioMuted.onchange=async()=>{preferences=await window.desktopMenu.setAudio({...preferences,muted:audioMuted.checked});display();};
