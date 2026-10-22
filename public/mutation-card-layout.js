// Measure only expanded cards; collapsed descriptions do not reserve space.
export function fitMutationDescriptions(root) {
 if(typeof getComputedStyle!=='function') return;
 const cards=[...root.querySelectorAll('[data-mutation-card]')].filter(card=>card.querySelector('.personality-toggle').getAttribute('aria-expanded')==='true');
 if(!cards.length) return;
 let longest=0;
 for(const card of cards) {
  const styles=getComputedStyle(card);
  const width=card.clientWidth-parseFloat(styles.paddingLeft)-parseFloat(styles.paddingRight);
  if(width<=0) continue;
  const probe=document.createElement('div');
  probe.className='personality-card-body';probe.inert=true;probe.setAttribute('aria-hidden','true');
  Object.assign(probe.style,{position:'fixed',visibility:'hidden',pointerEvents:'none',width:width+'px',left:'-10000px',top:'0'});
  const description=card.querySelector('.personality-card-description').cloneNode(true);
  description.removeAttribute('tabindex');description.style.height='auto';description.style.maxHeight='none';
  probe.append(description);card.append(probe);
  longest=Math.max(longest,Math.ceil(description.getBoundingClientRect().height));
  probe.remove();
 }
 if(longest) root.style.setProperty('--mutation-description-height',longest+'px');
}
export function watchMutationCardWidths(root) {
 let previousWidth=-1,frame;
 const observer=new ResizeObserver(entries=>{
  const width=entries[0].contentRect.width;
  if(width===previousWidth) return;
  previousWidth=width;cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>fitMutationDescriptions(root));
 });
 observer.observe(root);
 document.fonts?.ready.then(()=>fitMutationDescriptions(root));
}