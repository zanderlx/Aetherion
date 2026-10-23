const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktopMenu',{exit:()=>ipcRenderer.send('menu-exit'), version:()=>ipcRenderer.invoke('desktop-version')});
ipcRenderer.on('desktop-pause',()=>{
  let modal=document.querySelector('#desktop-pause');
  if(modal?.open){modal.close();return;}
  if(!modal){
    modal=document.createElement('dialog');modal.id='desktop-pause';
    modal.setAttribute('aria-label','Aetherion menu');
    Object.assign(modal.style,{background:'#28231f',color:'#eee5d6',border:'1px solid #a58a5d',borderRadius:'12px',padding:'32px',width:'min(380px,90vw)',boxShadow:'0 24px 90px #0009'});
    const style=document.createElement('style');
    style.textContent='#desktop-pause::backdrop{background:#100e0bbb;backdrop-filter:blur(5px)}#desktop-pause h2{text-align:center;color:var(--gold,#d2b477);font:30px Georgia,serif;margin:0 0 26px}#desktop-pause .pause-actions{display:grid;gap:12px}#desktop-pause button{padding:12px 20px;border:1px solid #675744;border-radius:5px;background:#211d1a;color:#eee5d6;font:16px "Segoe UI",sans-serif;cursor:pointer}#desktop-pause button:hover{background:#463c30;border-color:#d2b477}#desktop-pause button:first-child{border-color:#d2b477;background:#66533455}#desktop-pause button:focus-visible{outline:2px solid #d2b477;outline-offset:3px}';
    modal.append(style);
    const branding=document.createElement('div');
    branding.style.cssText='display:flex;flex-direction:column;align-items:center;gap:14px;margin-bottom:26px';
    const logo=document.createElementNS('http://www.w3.org/2000/svg','svg');
    logo.setAttribute('viewBox','0 0 80 80');logo.setAttribute('width','72');logo.setAttribute('height','72');logo.setAttribute('aria-hidden','true');
    for(const [tag,attributes] of [
      ['rect',{width:'80',height:'80',rx:'22',fill:'var(--panel-deep,#211d1a)'}],
      ['path',{d:'M40 7 65 22v28L40 73 15 50V22Z',fill:'none',stroke:'var(--gold,#d2b477)','stroke-width':'1.5'}],
      ['path',{d:'m28 57 2-16-7-5 6-11 8-3 5-10 4 12c13 3 15 17 10 32H28Z',fill:'var(--gold,#d2b477)'}],
      ['path',{d:'m35 32-4 5 9 3-1 17M46 25c6 8 7 20 3 32',fill:'none',stroke:'var(--panel-deep,#211d1a)','stroke-width':'2'}],
      ['circle',{cx:'34',cy:'29',r:'1.5',fill:'var(--panel-deep,#211d1a)'}]
    ]){const element=document.createElementNS(logo.namespaceURI,tag);for(const [key,value] of Object.entries(attributes))element.setAttribute(key,value);logo.append(element);}
    const title=document.createElement('h2');title.textContent='AETHERION';title.style.cssText='margin:0;letter-spacing:4px;font-size:27px;padding-left:4px';
    branding.append(logo,title);modal.append(branding);
    const actions=document.createElement('div');actions.className='pause-actions';
    for(const [label,action] of [['Back To Game',()=>modal.close()],['Main Menu',()=>ipcRenderer.send('pause-main-menu')],['Exit Game',()=>ipcRenderer.send('pause-exit')]]){
      const button=document.createElement('button');button.textContent=label;button.onclick=action;actions.append(button);
    }
    modal.append(actions);document.body.append(modal);
    modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}});
  }
  modal.showModal();
});
