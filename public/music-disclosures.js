// Animate native details while retaining summary keyboard behavior and final open state.
export function bindMusicDisclosures(root,signal){
 const running=new Map();
 const finish=(details,state)=>{
  if(running.get(details)!==state)return;
  details.open=state.open;
  details.style.height='';details.removeAttribute('data-expanding');
  details.removeAttribute('data-disclosure-animating');running.delete(details);
 };
 root.addEventListener('click',event=>{
  const summary=event.target.closest('summary'),details=summary?.parentElement;
  if(!details?.matches('details.music-group,details.music-playlist'))return;
  event.preventDefault();
  const previous=running.get(details),open=!(previous?previous.open:details.open);
  const height=details.getBoundingClientRect().height,content=summary.nextElementSibling;
  const opacity=previous&&content?Number(getComputedStyle(content).opacity):(open?0.5:1);
  previous?.heightAnimation.cancel();previous?.fadeAnimation?.cancel();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
   running.delete(details);details.style.height='';details.removeAttribute('data-expanding');details.removeAttribute('data-disclosure-animating');details.open=open;return;
  }
  details.open=true;details.style.height='';
  const style=getComputedStyle(details),summaryStyle=getComputedStyle(summary);
  const borders=parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
  const target=open?details.getBoundingClientRect().height:summary.getBoundingClientRect().height-parseFloat(summaryStyle.borderBottomWidth)+borders;
  details.style.height=height+'px';details.dataset.expanding=String(open);details.setAttribute('data-disclosure-animating','');
  const state={open};
  state.heightAnimation=details.animate([{height:height+'px'},{height:target+'px'}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'});
  state.fadeAnimation=content?.animate([{opacity},{opacity:open?1:0}],{duration:open?240:180,easing:'ease-out'});
  running.set(details,state);
  state.heightAnimation.finished.then(()=>finish(details,state)).catch(()=>{});
  state.fadeAnimation?.finished.catch(()=>{});
 },{signal});
 signal?.addEventListener('abort',()=>{
  for(const [details,state] of running){state.heightAnimation.cancel();state.fadeAnimation?.cancel();finish(details,state);}
 },{once:true});
}
