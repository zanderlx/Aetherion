const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktopMenu',{exit:()=>ipcRenderer.send('menu-exit')});
ipcRenderer.on('desktop-pause',()=>{
  let modal=document.querySelector('#desktop-pause');
  if(modal?.open){modal.close();return;}
  if(!modal){
    modal=document.createElement('dialog');modal.id='desktop-pause';
    modal.setAttribute('aria-label','Paused');
    Object.assign(modal.style,{background:'#28231f',color:'#eee5d6',border:'1px solid #a58a5d',borderRadius:'12px',padding:'32px',width:'min(380px,90vw)',boxShadow:'0 24px 90px #0009'});
    const style=document.createElement('style');
    style.textContent='#desktop-pause::backdrop{background:#100e0bbb;backdrop-filter:blur(5px)}#desktop-pause h2{text-align:center;color:var(--gold,#d2b477);font:30px Georgia,serif;margin:0 0 26px}#desktop-pause .pause-actions{display:grid;gap:12px}#desktop-pause button{padding:12px 20px;border:1px solid #675744;border-radius:5px;background:#211d1a;color:#eee5d6;font:16px "Segoe UI",sans-serif;cursor:pointer}#desktop-pause button:hover{background:#463c30;border-color:#d2b477}#desktop-pause button:first-child{border-color:#d2b477;background:#66533455}#desktop-pause button:focus-visible{outline:2px solid #d2b477;outline-offset:3px}';
    modal.append(style);
    const title=document.createElement('h2');title.textContent='Paused';modal.append(title);
    const actions=document.createElement('div');actions.className='pause-actions';
    for(const [label,action] of [['Back To Game',()=>modal.close()],['Main Menu',()=>ipcRenderer.send('pause-main-menu')],['Exit Game',()=>ipcRenderer.send('pause-exit')]]){
      const button=document.createElement('button');button.textContent=label;button.onclick=action;actions.append(button);
    }
    modal.append(actions);document.body.append(modal);
    modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}});
  }
  modal.showModal();
});
