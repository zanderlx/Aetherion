import {parseChangelog} from '../public/changelog.js';
export function bindChangelog(){
  const open=document.querySelector('#open-changelog'),dialog=document.querySelector('#changelog-dialog'),body=dialog.querySelector('.changelog-content');
  let loaded=false;
  const appendText=(parent,tag,text,className)=>{
    const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;parent.append(node);return node;
  };
  open.addEventListener('click',async()=>{
    dialog.showModal();
    if(loaded)return;
    body.textContent='Loading changelog…';
    try{
      const [source,version]=await Promise.all([window.desktopMenu.changelog(),window.desktopMenu.version()]);
      const entries=parseChangelog(source);body.replaceChildren();
      for(const entry of entries){
        const section=document.createElement('section');section.className='changelog-release';
        const heading=appendText(section,'h3','v'+entry.version);
        if(entry.version===version)appendText(heading,'span',entry.date==='Unreleased'?'Upcoming':'Current','changelog-badge');
        const date=appendText(section,entry.date==='Unreleased'?'span':'time',entry.date==='Unreleased'?'Unreleased':entry.date,'changelog-date');
        if(entry.date!=='Unreleased')date.dateTime=entry.date;
        entry.summary.forEach(text=>appendText(section,'p',text));
        for(const category of entry.sections){
          if(!category.items.length)continue;
          appendText(section,'h4',category.name);
          const list=document.createElement('ul');
          category.items.forEach(text=>appendText(list,'li',text));
          section.append(list);
        }
        body.append(section);
      }
      loaded=true;
    }catch{body.textContent='Could not load the changelog. Close and reopen this window to retry.';}
  });
  dialog.querySelector('[data-close-changelog]').onclick=()=>dialog.close();
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
  });
}
