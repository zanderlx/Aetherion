import {horseArt} from './art.js';
import {icon} from './ui.js';

const equipmentSlots=['Hat','Mouth','Bridle','Saddle','Sock','Side','Tail','Flair'];
const skillNames=['Agility','Strength','Jump','Bond','Wing'];
function portrait(horse,suffix) {
  const art=horseArt({...horse,id:`${horse.id}-${suffix}`},true).replace('viewBox="0 0 460 310"','viewBox="240 25 135 145"');
  return `<div class="profile-portrait">${art}</div>`;
}
function equipment() {
  return `<section class="profile-equipment"><h3>Equipment</h3><p class="muted profile-unavailable">Equipment is not available yet.</p><dl>${equipmentSlots.map(slot=>`<div><span class="equipment-slot" aria-hidden="true">${icon('bag')}</span><div><dt>${slot}</dt><dd>Not equipped</dd></div></div>`).join('')}</dl></section>`;
}
function skills() {
  return `<section class="profile-skills"><h3>Skills</h3><p class="muted profile-unavailable">Skill training is not available yet.</p><dl>${skillNames.map(name=>`<div><dt>${name}</dt><dd aria-label="Not available">—</dd></div>`).join('')}</dl></section>`;
}
export function profileLayout(horse,{header,info,notes,colors,traits,mutations,actions,importPreview}) {
  const prefix=importPreview ? 'import-horse' : 'horse-profile';
  return `<div class="horse-profile-book">
    <div class="profile-tab-rail" role="tablist" aria-label="Horse profile pages" aria-orientation="vertical" data-copy-skip>
      <button type="button" role="tab" id="${prefix}-overview-tab" aria-controls="${prefix}-overview" aria-selected="true" data-profile-tab="overview" title="Horse Information">${icon('stable')}<span>Info</span></button>
      <button type="button" role="tab" id="${prefix}-appearance-tab" aria-controls="${prefix}-appearance" aria-selected="false" tabindex="-1" data-profile-tab="appearance" title="Colors, Traits & Mutations">${icon('spark')}<span>Traits</span></button>
    </div>
    <div class="profile-scroll-frame">${header}<div class="horse-profile-shell"><section class="profile-tab-panel" id="${prefix}-overview" role="tabpanel" aria-labelledby="${prefix}-overview-tab" data-profile-panel="overview">
      <div class="profile-grid profile-overview-top">${portrait(horse,'overview')}<div class="profile-info">${info}</div></div>
      <div class="profile-overview-bottom">${equipment()}<div class="profile-notes-skills">${notes}${skills()}</div></div>
    </section>
    <section class="profile-tab-panel" id="${prefix}-appearance" role="tabpanel" aria-labelledby="${prefix}-appearance-tab" data-profile-panel="appearance" hidden>
      <div class="profile-grid profile-appearance-top">${portrait(horse,'appearance')}<div class="profile-palette">${colors}</div></div>
      <div class="profile-lower"><section class="profile-traits"><h3>Traits</h3>${traits}</section><section class="profile-mutations">${mutations}</section></div>
    </section>
  </div>${actions}</div></div>`;
}

export function selectProfileTab(root,key,{focus=false}={}) {
  const tabs=[...root.querySelectorAll('[data-profile-tab]')];
  if (!tabs.some(tab=>tab.dataset.profileTab===key)) return;
  for (const tab of tabs) {
    const active=tab.dataset.profileTab===key;
    tab.setAttribute('aria-selected',String(active));tab.tabIndex=active ? 0 : -1;
    if (active && focus) tab.focus();
  }
  for (const panel of root.querySelectorAll('[data-profile-panel]')) panel.hidden=panel.dataset.profilePanel!==key;
}
export function bindProfileTabs() {
  document.addEventListener('click',event=>{
    const tab=event.target.closest('[data-profile-tab]');
    if (tab) selectProfileTab(tab.closest('.horse-profile-book'),tab.dataset.profileTab);
  });
  document.addEventListener('keydown',event=>{
    const tab=event.target.closest('[data-profile-tab]');
    if (!tab || !['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const root=tab.closest('.horse-profile-book'),tabs=[...root.querySelectorAll('[data-profile-tab]')];
    const index=tabs.indexOf(tab),previous=['ArrowUp','ArrowLeft'].includes(event.key);
    const next=event.key==='Home' ? 0 : event.key==='End' ? tabs.length-1 : (index+(previous ? -1 : 1)+tabs.length)%tabs.length;
    selectProfileTab(root,tabs[next].dataset.profileTab,{focus:true});
  });
}
