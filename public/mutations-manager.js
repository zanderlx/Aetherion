import {escapeHTML as e,icon} from './ui.js';
import {formSignature,formBaseline} from './form-state.js';

const typeOrder = ['Standard','Special','Mutated'];
const compareType = (a,b) => (typeOrder.includes(a) ? typeOrder.indexOf(a) : typeOrder.length)-(typeOrder.includes(b) ? typeOrder.indexOf(b) : typeOrder.length) || a.localeCompare(b);
export const mutationTypes = entries => [...new Set([...typeOrder,...entries.map(m=>m.type)])].sort(compareType);

export function filterMutations(entries,query='',type='',sort='name',direction=sort==='weight' ? 'desc' : 'asc') {
  const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter(m=>(!type || m.type===type) && words.every(word=>`${m.name} ${m.type} ${m.description || ''}`.toLowerCase().includes(word))).sort((a,b)=>(direction==='desc' ? -1 : 1)*(sort==='type' ? compareType(a.type,b.type) || a.name.localeCompare(b.name) : sort==='weight' ? Math.abs(a.weight || 0)-Math.abs(b.weight || 0) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name)));
}
export function mutationResults(entries,sort='type',showWeights=false,direction='asc') {
  if (sort !== 'type') return mutationCards(entries,showWeights);
  const types=mutationTypes(entries).filter(type=>entries.some(m=>m.type===type));
  if (direction==='desc') types.reverse();
  return types.map(type=>`<section class="eye-rarity-section"><h2>${e(type)}</h2><div class="eye-definition-grid mutation-definition-grid">${mutationCards(entries.filter(m=>m.type===type),showWeights)}</div></section>`).join('');
}
export function mutationCards(entries,showWeights=false) {
  return entries.map(m=>`<button type="button" class="panel eye-definition-card mutation-definition-card" data-action="edit-definition" data-kind="mutations" data-id="${e(m.id)}" aria-label="Edit ${e(m.name)}"><span class="eye-card-name">${e(m.name)}</span><span class="mutation-card-description">${e(m.description || 'No description yet.')}</span><span class="mutation-card-meta"><span>${e(m.type)}</span>${showWeights ? `<span>Weight: ${Math.abs(m.weight || 0).toLocaleString()}</span>` : ''}</span></button>`).join('');
}
export function mutationsManagerPage(catalog) {
  return `<div class="definitions-header eye-manager-header"><h1 class="manager-heading">Mutations Manager</h1><button class="button primary" data-action="new-definition" data-kind="mutations">${icon('spark')} Create Mutation</button></div>
  <div class="eye-grid-controls"><label class="zone-field">Search<input id="mutation-search" type="search" placeholder="Search..." aria-label="Search mutations"></label><label class="zone-field">Type<select id="mutation-type"><option value="">All Types</option>${mutationTypes(catalog.mutations).map(type=>`<option value="${e(type)}">${e(type)}</option>`).join('')}</select></label><label class="zone-field eye-percent-control"><span><input id="mutation-weights" type="checkbox"> Show Weights</span></label><div class="definition-sort-controls"><label class="zone-field">Sort By<select id="mutation-sort"><option value="type" selected>Type</option><option value="name">Name</option><option value="weight">Weight</option></select></label><button type="button" class="icon-button sort-direction" data-action="mutation-sort-direction" data-direction="asc" aria-label="Ascending order. Switch to descending" title="Ascending order. Switch to descending">${icon('arrow')}</button></div></div>
  <div id="mutation-grid">${mutationResults(filterMutations(catalog.mutations,'','','type'))}</div><p id="mutation-empty" role="status" ${catalog.mutations.length ? 'hidden' : ''}>No mutations match your filters.</p>`;
}
export function updateMutationGrid(root,catalog) {
  const toggle=root.querySelector('[data-action="mutation-sort-direction"]');
  const direction=toggle.dataset.direction;
  const label=direction==='asc' ? 'Ascending order. Switch to descending' : 'Descending order. Switch to ascending';
  toggle.setAttribute('aria-label',label);toggle.title=label;
  const entries=filterMutations(catalog.mutations,root.querySelector('#mutation-search').value,root.querySelector('#mutation-type').value,root.querySelector('#mutation-sort').value,direction);
  const sort=root.querySelector('#mutation-sort').value;
  const grid=root.querySelector('#mutation-grid');
  grid.classList.toggle('eye-definition-grid',sort!=='type');
  grid.classList.toggle('mutation-definition-grid',sort!=='type');
  grid.innerHTML=mutationResults(entries,sort,root.querySelector('#mutation-weights').checked,direction);
  root.querySelector('#mutation-empty').hidden=entries.length>0;
}

export function createMutationEditor(renderEditor) {
  const dialog=document.createElement('dialog');
  dialog.className='eye-definition-dialog mutation-definition-dialog';
  dialog.setAttribute('aria-labelledby','mutation-editor-title');
  const prompt=document.createElement('dialog');
  prompt.className='eye-save-confirm';
  prompt.setAttribute('aria-labelledby','mutation-save-title');
  prompt.innerHTML=`<div class="dialog-top"><h2 id="mutation-save-title">Save Changes?</h2></div><p>You have unsaved mutation changes. Save them before closing?</p><div class="form-actions"><button type="button" class="button secondary" data-mutation-decision="keep" autofocus>Keep Editing</button><button type="button" class="button secondary" data-mutation-decision="discard">Discard Changes</button><button type="button" class="button primary" data-mutation-decision="save">Save</button></div>`;
  document.body.append(dialog,prompt);
  function requestClose() {
    const form=dialog.querySelector('form');
    if (!form || formSignature(form)===formBaseline(form)) dialog.close();
    else if (!prompt.open) prompt.showModal();
  }
  prompt.addEventListener('click',event=>{
    const decision=event.target.closest('[data-mutation-decision]')?.dataset.mutationDecision;
    if (!decision) return;
    prompt.close();
    if (decision==='discard') dialog.close();
    if (decision==='save') dialog.querySelector('form')?.requestSubmit();
  });
  dialog.addEventListener('cancel',event=>{event.preventDefault();requestClose();});
  dialog.addEventListener('close',()=>{if (!dialog.open) dialog.replaceChildren();});
  dialog.addEventListener('click',event=>{
    if (event.target.closest('[data-mutation-close]')) return requestClose();
    if (event.target!==dialog) return;
    const bounds=dialog.getBoundingClientRect();
    if (event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom) requestClose();
  });
  return {dialog,open(draft) {
    const template=document.createElement('template');
    template.innerHTML=renderEditor(draft);
    const form=template.content.querySelector('#definition-form');
    form.querySelector('.panel-heading')?.remove();
    form.querySelector('[data-action="duplicate-definition"]')?.remove();
    dialog.innerHTML=`<div class="dialog-top"><h2 id="mutation-editor-title">${draft?.id ? `Edit ${e(draft.name)}` : 'Create Mutation'}</h2><button type="button" class="icon-button" data-mutation-close aria-label="Close mutation editor">${icon('close')}</button></div>`;
    const remove=form.querySelector('[data-action="delete-definition"]');
    if (remove) {
      remove.className='icon-button eye-header-delete';
      remove.innerHTML=icon('trash');
      remove.title='Delete Mutation';remove.setAttribute('aria-label',`Delete ${draft.name}`);
      dialog.querySelector('h2').after(remove);
    }
    const fields=form.querySelector('.definition-fields');
    const row=document.createElement('div');row.className='eye-name-rarity';
    row.append(fields.querySelector('[name="name"]').closest('label'),fields.querySelector('[name="type"]').closest('label'));
    fields.prepend(row);
    dialog.append(form);dialog.scrollTop=0;
    if (!dialog.open) dialog.showModal();
    form.elements.name.focus();
  }};
}
