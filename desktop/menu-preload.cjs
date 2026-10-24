const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktopMenu',{exit:()=>ipcRenderer.send('menu-exit'), version:()=>ipcRenderer.invoke('desktop-version'), changelog:()=>ipcRenderer.invoke('desktop-changelog'), audio:()=>ipcRenderer.invoke('audio-state'), setAudio:value=>ipcRenderer.invoke('audio-set',value)});
ipcRenderer.on('desktop-pause',()=>{
  const changelog=document.querySelector('#changelog-dialog');if(changelog?.open){changelog.close();return;}
  const audioDialog=document.querySelector('#desktop-audio');if(audioDialog?.open){audioDialog.close();return;}
  let modal=document.querySelector('#desktop-pause');
  if(modal?.open){modal.close();return;}
  if(!modal){
    modal=document.createElement('dialog');modal.id='desktop-pause';
    modal.setAttribute('aria-label','Gallorin menu');
    Object.assign(modal.style,{background:'#28231f',color:'#eee5d6',border:'1px solid #a58a5d',borderRadius:'12px',padding:'32px',width:'min(380px,90vw)',boxShadow:'0 24px 90px #0009'});
    const style=document.createElement('style');
    style.textContent='#desktop-pause::backdrop{background:#100e0bbb;backdrop-filter:blur(5px)}#desktop-pause h2{text-align:center;color:var(--gold,#d2b477);font:30px Georgia,serif;margin:0 0 26px}#desktop-pause .pause-actions{display:grid;gap:12px}#desktop-pause button{padding:12px 20px;border:1px solid #675744;border-radius:5px;background:#211d1a;color:#eee5d6;font:16px "Segoe UI",sans-serif;cursor:pointer}#desktop-pause button:hover{background:#463c30;border-color:#d2b477}#desktop-pause button:first-child{border-color:#d2b477;background:#66533455}#desktop-pause button:focus-visible{outline:2px solid #d2b477;outline-offset:3px}';
    modal.append(style);
    const branding=document.createElement('div');
    branding.style.cssText='display:flex;flex-direction:column;align-items:center;gap:14px;margin-bottom:26px';
    const logo=document.createElement('span');
    logo.style.cssText='display:block;width:72px;height:72px';
    ipcRenderer.invoke('desktop-logo').then(markup=>{logo.innerHTML=markup;}).catch(()=>{});
    const title=document.createElement('h2');title.textContent='GALLORIN';title.style.cssText='margin:0;letter-spacing:4px;font-size:27px;padding-left:4px';
    branding.append(logo,title);modal.append(branding);
    const actions=document.createElement('div');actions.className='pause-actions';
    for(const [label,action] of [['Back To Game',()=>modal.close()],['Settings',()=>showAudioSettings()],['Main Menu',async()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)await document.body.animate([{opacity:1},{opacity:0}],{duration:420,easing:'cubic-bezier(0.4,0,0.6,1)',fill:'forwards'}).finished;ipcRenderer.send('pause-main-menu');}],['Exit Game',()=>ipcRenderer.send('pause-exit')]]){
      const button=document.createElement('button');button.textContent=label;button.onclick=action;actions.append(button);
    }
    modal.append(actions);document.body.append(modal);
    modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}});
  }
  modal.style.background='var(--panel,#28231f)';modal.style.color='var(--text,#eee5d6)';modal.style.borderColor='var(--gold-soft,#a58a5d)';
  modal.querySelectorAll('button').forEach(button=>{button.style.background='var(--panel-deep,#211d1a)';button.style.color='var(--text,#eee5d6)';button.style.borderColor='var(--border,#675744)';});
  modal.showModal();
});

async function showAudioSettings(){
  let modal=document.querySelector('#desktop-audio');
  if(!modal){
    modal=document.createElement('dialog');modal.id='desktop-audio';
    modal.style.cssText='background:#28231f;color:#eee5d6;border:1px solid #a58a5d;border-radius:12px;padding:32px;width:min(380px,90vw)';
    const style=document.createElement('style');style.textContent='#desktop-audio::backdrop{background:#101811bd;backdrop-filter:blur(5px)}#desktop-audio{position:relative;background:var(--panel,#252b24)!important;color:var(--text,#e9d8b4)!important;border:1px solid var(--gold-soft,#9a8454)!important;border-radius:10px!important;width:min(430px,90vw)!important;padding:32px!important}#desktop-audio h2{font:30px Georgia,serif;margin:0 0 30px}#desktop-audio h3{font:600 14px Segoe UI,sans-serif;text-transform:uppercase;letter-spacing:2px;color:var(--gold,#d2b477);margin:0 0 22px}#desktop-audio label{display:flex;justify-content:space-between;font:15px Segoe UI,sans-serif}#desktop-audio output{color:var(--gold,#d2b477)}#desktop-audio button{font:16px Segoe UI,sans-serif;color:var(--text,#e9d8b4);cursor:pointer;border:1px solid var(--gold,#d2b477);background:var(--panel-deep,#211d1a);border-radius:5px;padding:12px 24px;width:100%;margin-top:20px}#desktop-audio button:hover{background:var(--border,#48503c)}#desktop-audio .audio-close{position:absolute;top:12px;right:12px;border:0;background:none;font-size:24px;padding:3px 10px;margin:0;width:auto}';modal.append(style);
    const close=document.createElement('button');close.className='audio-close';close.textContent='×';close.setAttribute('aria-label','Close settings');close.onclick=()=>modal.close();modal.append(close);
    const title=document.createElement('h2');title.textContent='Settings';modal.append(title);
    const heading=document.createElement('h3');heading.textContent='Audio';modal.append(heading);
    const label=document.createElement('label');label.textContent='Music Volume ';
    const output=document.createElement('output');label.append(output);modal.append(label);
    const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=100;slider.style.cssText='appearance:auto;width:100%;min-height:0;height:20px;padding:0;border:0;background:transparent;accent-color:var(--gold,#d2b477);margin:24px 0;box-sizing:border-box';modal.append(slider);
    slider.oninput=async()=>{output.textContent=slider.value+'%';const state=await ipcRenderer.invoke('audio-state');await ipcRenderer.invoke('audio-set',{...state,volume:Number(slider.value)});};
    const muteLabel=document.createElement('label');muteLabel.textContent='Mute Music';muteLabel.style.alignItems='center';
    const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id='audio-muted';checkbox.style.cssText='width:auto;min-height:0;margin:0;accent-color:var(--gold,#d2b477)';
    checkbox.onchange=async()=>{const state=await ipcRenderer.invoke('audio-state');await ipcRenderer.invoke('audio-set',{...state,muted:checkbox.checked});document.querySelector('#desktop-music-toggle').textContent=checkbox.checked?'♫ Music Off':'♫ Music On';};
    muteLabel.append(checkbox);modal.append(muteLabel);
    const done=document.createElement('button');done.textContent='Done';done.onclick=()=>modal.close();modal.append(done);document.body.append(modal);modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}});
  }
  const state=await ipcRenderer.invoke('audio-state');modal.querySelector('input[type=range]').value=state.volume;modal.querySelector('#audio-muted').checked=state.muted;modal.querySelector('output').textContent=state.volume+'%';modal.showModal();
}
window.addEventListener('DOMContentLoaded',async()=>{
  if(location.protocol==='file:')return;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const cover=document.createElement('div');
    cover.style.cssText='position:fixed;inset:0;background:#1d1b18;z-index:2147483647;pointer-events:none';
    document.documentElement.append(cover);
    const reveal=async()=>{
      await document.fonts.ready;
      await new Promise(resolve=>setTimeout(resolve,350));
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      await cover.animate([{opacity:1},{opacity:0}],{duration:1100,easing:'cubic-bezier(0.4,0,0.2,1)',fill:'forwards'}).finished;
      cover.remove();
    };
    if(document.querySelector('.brand'))void reveal();
    else{
      const observer=new MutationObserver(()=>{if(document.querySelector('.brand')){observer.disconnect();clearTimeout(fallback);void reveal();}});
      observer.observe(document.body,{childList:true,subtree:true});
      const fallback=setTimeout(()=>{observer.disconnect();void reveal();},5000);
    }
  }
  const toggle=document.createElement('button');toggle.id='desktop-music-toggle';
  toggle.style.cssText='position:fixed;bottom:42px;right:48px;z-index:40;background:#202b25;color:#e9d8b4;border:1px solid #d2b47755;border-radius:5px;padding:9px 15px;font:13px Segoe UI;cursor:pointer';
  const refresh=async()=>{const state=await ipcRenderer.invoke('audio-state');toggle.textContent=state.muted?'♫ Music Off':'♫ Music On';toggle.title=state.muted?'Unmute music':'Mute music';};
  toggle.onclick=async()=>{const state=await ipcRenderer.invoke('audio-state');await ipcRenderer.invoke('audio-set',{...state,muted:!state.muted});await refresh();};
  document.body.append(toggle);await refresh();
});