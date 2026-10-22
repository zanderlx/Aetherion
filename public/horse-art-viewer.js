import {icon} from './ui.js';

export function bindHorseArtViewer() {
  let dialog;
  document.addEventListener('click',event=>{
    const portrait=event.target.closest('[data-full-horse]');
    if (!portrait) return;
    const source=portrait.querySelector('svg');
    if (!source) return;
    if (!dialog) {
      dialog=document.createElement('dialog');
      dialog.id='horse-art-viewer';
      dialog.setAttribute('aria-label','Full horse illustration');
      document.body.append(dialog);
      dialog.addEventListener('click',event=>{
        if (event.target.closest('[data-close-horse-art]')) return dialog.close();
        if (event.target!==dialog) return;
        const bounds=dialog.getBoundingClientRect();
        if (event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom) dialog.close();
      });
      dialog.addEventListener('close',()=>{if (!dialog.open) dialog.replaceChildren();});
    }
    const art=source.cloneNode(true);
    art.setAttribute('viewBox','0 0 460 310');
    // Keep gradient IDs unique while the source profile remains open underneath.
    const ids=new Map([...art.querySelectorAll('[id]')].map(node=>[node.id,`viewer-${crypto.randomUUID()}`]));
    for(const node of [art,...art.querySelectorAll('*')]) {
      for(const attr of [...node.attributes]) {
        let value=attr.value;
        if(attr.name==='id') value=ids.get(value) || value;
        else for(const [oldID,newID] of ids) value=value.replaceAll(`url(#${oldID})`,`url(#${newID})`);
        node.setAttribute(attr.name,value);
      }
    }
    dialog.innerHTML=`<div class="horse-art-viewer-header"><button type="button" class="icon-button" data-close-horse-art aria-label="Close full horse illustration">${icon('close')}</button></div><div class="horse-art-viewer-stage"></div>`;
    dialog.querySelector('.horse-art-viewer-stage').append(art);
    dialog.showModal();
  });
  return {close:()=>dialog?.close()};
}
